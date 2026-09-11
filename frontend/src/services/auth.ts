/**
 * Serviço de autenticação AWS Cognito para o Va'aFlow.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 * Substitui o mock de login: agora emite um JWT real, exigido pelo
 * CognitoAuth do API Gateway (ver template.yaml).
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '';

const userPool =
  USER_POOL_ID && CLIENT_ID
    ? new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID })
    : null;

// Sessão mantida em memória durante o uso do app.
let currentSession: CognitoUserSession | null = null;
let currentCognitoUser: CognitoUser | null = null;

function ensurePoolConfigured() {
  if (!userPool) {
    throw new Error(
      'Cognito não configurado. Verifique EXPO_PUBLIC_COGNITO_USER_POOL_ID e EXPO_PUBLIC_COGNITO_CLIENT_ID no .env'
    );
  }
}

export function signIn(email: string, password: string): Promise<CognitoUserSession> {
  ensurePoolConfigured();
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool! });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        currentSession = session;
        currentCognitoUser = cognitoUser;
        resolve(session);
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: () => {
        reject(new Error('Senha temporária detectada. Redefina a senha antes de continuar.'));
      },
    });
  });
}

export function signUp(
  name: string,
  email: string,
  password: string,
  accessibilityNeeds: boolean
): Promise<void> {
  ensurePoolConfigured();
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
      new CognitoUserAttribute({
        Name: 'custom:accessibility_needs',
        Value: accessibilityNeeds ? 'true' : 'false',
      }),
    ];

    userPool!.signUp(email, password, attributes, [], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  ensurePoolConfigured();
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool! });
    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function resendConfirmationCode(email: string): Promise<void> {
  ensurePoolConfigured();
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool! });
    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/** Dispara o envio do código de redefinição de senha para o e-mail do usuário. */
export function forgotPassword(email: string): Promise<void> {
  ensurePoolConfigured();
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool! });
    cognitoUser.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

/** Confirma o código recebido e define a nova senha. */
export function confirmNewPassword(email: string, code: string, newPassword: string): Promise<void> {
  ensurePoolConfigured();
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool! });
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

export function signOut(): void {
  const cognitoUser = currentCognitoUser || userPool?.getCurrentUser() || null;
  cognitoUser?.signOut();
  currentSession = null;
  currentCognitoUser = null;
}

/** Retorna o ID Token JWT válido, renovando via refresh token se necessário.
 *  Também restaura a sessão salva pelo Cognito (localStorage) em caso de reload da página. */
export function getIdToken(): Promise<string | null> {
  const cognitoUser = currentCognitoUser || userPool?.getCurrentUser() || null;
  if (!cognitoUser) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      currentCognitoUser = cognitoUser;
      currentSession = session;
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

/** Verifica se existe uma sessão válida (nova ou restaurada de reload). */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getIdToken();
  return token !== null;
}

/** Decodifica o payload do ID Token (sem validar assinatura — só para ler claims no client). */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Retorna o role do usuário logado ('ATHLETE' | 'INSTRUCTOR' | 'ADMIN'), lido do próprio token. */
export async function getCurrentUserRole(): Promise<string> {
  const token = await getIdToken();
  if (!token) return 'ATHLETE';
  const payload = decodeJwtPayload(token);
  return payload?.['custom:role'] || 'ATHLETE';
}

/** Retorna o e-mail real do usuário logado, lido do claim do token
 *  (o "username" interno do Cognito é um UUID, não o e-mail). */
export async function getCurrentUserEmail(): Promise<string | null> {
  const token = await getIdToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return payload?.email || null;
}

// --- Notificação simples de sessão expirada (para logout automático na UI) ---
type UnauthorizedListener = () => void;
const unauthorizedListeners: UnauthorizedListener[] = [];

export function onSessionExpired(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.push(listener);
  return () => {
    const idx = unauthorizedListeners.indexOf(listener);
    if (idx !== -1) unauthorizedListeners.splice(idx, 1);
  };
}

export function notifySessionExpired(): void {
  signOut();
  unauthorizedListeners.forEach((l) => l());
}
