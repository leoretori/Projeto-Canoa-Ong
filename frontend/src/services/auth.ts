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

// --- Fallback gracioso para ambiente de Desenvolvimento Local (dev_server.py) ---
interface LocalDevSession {
  email: string;
  name: string;
  role: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
  token: string;
}

const LOCAL_DEV_STORAGE_KEY = 'vaaflow_dev_session';
let localDevSession: LocalDevSession | null = null;

function getStoredDevSession(): LocalDevSession | null {
  if (localDevSession) return localDevSession;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(LOCAL_DEV_STORAGE_KEY);
      if (stored) {
        localDevSession = JSON.parse(stored);
        return localDevSession;
      }
    } catch {}
  }
  return null;
}

function setStoredDevSession(session: LocalDevSession | null) {
  localDevSession = session;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (session) {
        window.localStorage.setItem(LOCAL_DEV_STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(LOCAL_DEV_STORAGE_KEY);
      }
    } catch {}
  }
}

function safeBase64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)));
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let block = 0, charCode = 0, i = 0; i < str.length || i % 3 !== 0; ) {
    if (i < str.length) {
      charCode = str.charCodeAt(i);
      block = (block << 8) | charCode;
    } else {
      block = block << 8;
    }
    i++;
    if (i % 3 === 0) {
      output += chars.charAt((block >> 18) & 63);
      output += chars.charAt((block >> 12) & 63);
      output += chars.charAt((block >> 6) & 63);
      output += chars.charAt(block & 63);
      block = 0;
    }
  }
  return output;
}

function createDevJwtToken(email: string, name: string, role: string, sub: string): string {
  const header = safeBase64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadObj = {
    sub,
    email,
    name,
    'custom:role': role,
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
  };
  const payload = safeBase64Encode(JSON.stringify(payloadObj));
  return `${header}.${payload}.mock_local_signature`;
}

function ensurePoolConfigured() {
  if (!userPool) {
    throw new Error(
      'Cognito não configurado. Verifique EXPO_PUBLIC_COGNITO_USER_POOL_ID e EXPO_PUBLIC_COGNITO_CLIENT_ID no .env'
    );
  }
}

export function signIn(email: string, password: string): Promise<CognitoUserSession | any> {
  if (!userPool) {
    // Simulação no dev_server.py: emails com 'admin' viram ADMIN, 'instrutor' viram INSTRUCTOR
    const trimmedEmail = email.trim().toLowerCase();
    let role: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN' = 'ATHLETE';
    if (trimmedEmail.includes('admin')) {
      role = 'ADMIN';
    } else if (trimmedEmail.includes('instrutor') || trimmedEmail.includes('instructor')) {
      role = 'INSTRUCTOR';
    }
    const namePart = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const sub = `local-${trimmedEmail.replace(/[^a-z0-9]/g, '-')}`;
    const token = createDevJwtToken(trimmedEmail, name, role, sub);
    const session: LocalDevSession = { email: trimmedEmail, name, role, token };
    setStoredDevSession(session);
    return Promise.resolve({
      getIdToken: () => ({ getJwtToken: () => token }),
      isValid: () => true,
    });
  }

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
  if (!userPool) {
    return Promise.resolve();
  }
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
  if (!userPool) {
    return Promise.resolve();
  }
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
  if (!userPool) {
    return Promise.resolve();
  }
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
  if (!userPool) {
    return Promise.resolve();
  }
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
  if (!userPool) {
    return Promise.resolve();
  }
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
  if (!userPool) {
    setStoredDevSession(null);
    return;
  }
  const cognitoUser = currentCognitoUser || userPool?.getCurrentUser() || null;
  cognitoUser?.signOut();
  currentSession = null;
  currentCognitoUser = null;
}

/** Retorna o ID Token JWT válido, renovando via refresh token se necessário.
 *  Também restaura a sessão salva pelo Cognito (localStorage) em caso de reload da página. */
export function getIdToken(): Promise<string | null> {
  if (!userPool) {
    const dev = getStoredDevSession();
    return Promise.resolve(dev ? dev.token : null);
  }
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
  if (!userPool) {
    const dev = getStoredDevSession();
    return dev ? dev.role : 'ATHLETE';
  }
  const token = await getIdToken();
  if (!token) return 'ATHLETE';
  const payload = decodeJwtPayload(token);
  return payload?.['custom:role'] || 'ATHLETE';
}

/** Retorna o e-mail real do usuário logado, lido do claim do token
 *  (o "username" interno do Cognito é um UUID, não o e-mail). */
export async function getCurrentUserEmail(): Promise<string | null> {
  if (!userPool) {
    const dev = getStoredDevSession();
    return dev ? dev.email : null;
  }
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
