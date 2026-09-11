/**
 * Cliente de API HTTP para o Va'aFlow.
 * Gerenciado pelo Subagent 2 (Front-End/UI).
 * Comunica com o AWS API Gateway ou com o Dev Server local (http://localhost:8000).
 * Possui fallback mock gracioso caso o servidor local ainda não tenha sido iniciado.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

import { getIdToken, notifySessionExpired } from './auth';

export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  has_accessibility_needs: boolean;
  accessibility_type: 'NONE' | 'WHEELCHAIR' | 'REDUCED_MOBILITY' | 'VISUAL_IMPAIRMENT' | 'OTHER';
  role: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
  notes?: string;
}

export interface AdminUser {
  user_id: string;
  email: string;
  name: string;
  role: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
  status: string;
  enabled: boolean;
}

export interface Session {
  session_id: string;
  date: string;
  time: string;
  location: string;
  canoe_type: string;
  total_capacity: number;
  booked_seats: number;
  max_adapted_seats: number;
  booked_adapted_seats: number;
  status: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  instructor_name?: string;
  notes?: string;
}

export interface Reservation {
  reservation_id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  requires_adapted_seat: boolean;
  status: string;
  notes?: string;
  created_at: string;
}

// Fallback in-memory para testes puramente de UI
let fallbackSessions: Session[] = [
  {
    session_id: 'session-demo-1',
    date: '2026-10-25',
    time: '06:00',
    location: 'Praia Grande - São Sebastião',
    canoe_type: 'OC6',
    total_capacity: 6,
    booked_seats: 4,
    max_adapted_seats: 2,
    booked_adapted_seats: 1,
    status: 'OPEN',
    instructor_name: 'Mestre Kaique',
    notes: 'Saída ao nascer do sol com assento adaptado montado.'
  },
  {
    session_id: 'session-demo-2',
    date: '2026-10-25',
    time: '08:30',
    location: 'Praia Grande - São Sebastião',
    canoe_type: 'OC6',
    total_capacity: 6,
    booked_seats: 6,
    max_adapted_seats: 2,
    booked_adapted_seats: 2,
    status: 'FULL',
    instructor_name: 'Instrutora Fernanda'
  },
  {
    session_id: 'session-demo-3',
    date: '2026-10-26',
    time: '07:00',
    location: 'Centro Histórico - São Sebastião',
    canoe_type: 'OC6',
    total_capacity: 6,
    booked_seats: 1,
    max_adapted_seats: 2,
    booked_adapted_seats: 0,
    status: 'OPEN',
    instructor_name: 'Instrutor Carlos'
  }
];

let fallbackReservations: Reservation[] = [
  {
    reservation_id: 'res-demo-1',
    session_id: 'session-demo-1',
    user_id: 'user-demo-me',
    user_name: 'Remador UniSENAI',
    user_email: 'remador@cpt.org',
    requires_adapted_seat: true,
    status: 'CONFIRMED',
    created_at: '2026-09-09T12:00:00Z',
    notes: 'Assento adaptado solicitado com apoio de embarque'
  }
];

class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await getIdToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = token;
      try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
        );
        const payload = JSON.parse(json);
        if (payload.sub) headers['X-User-Id'] = payload.sub;
        if (payload.name) headers['X-User-Name'] = payload.name;
        if (payload.email) headers['X-User-Email'] = payload.email;
        if (payload['custom:role']) headers['X-User-Role'] = payload['custom:role'];
      } catch {}
    } else {
      // Fallback apenas para backend/dev_server.py local (sem Cognito real).
      headers['X-User-Id'] = 'user-demo-me';
      headers['X-User-Name'] = 'Remador UniSENAI';
      headers['X-User-Email'] = 'remador@cpt.org';
      headers['X-User-Role'] = 'ATHLETE';
    }
    return headers;
  }

  private checkAuthError(response: Response) {
    if (response.status === 401) {
      notifySessionExpired();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  async getSessions(limit: number = 50): Promise<Session[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions?limit=${limit}`, {
        method: 'GET',
        headers: await this.getHeaders()
      });
      this.checkAuthError(response);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      const fallback = [...fallbackSessions];
      (fallback as any).__isFallback = true;
      return fallback;
    }
  }

  async createSession(sessionData: Partial<Session>): Promise<Session> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(sessionData)
      });
      this.checkAuthError(response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar sessão');
      }
      return await response.json();
    } catch {
      const newSession: Session = {
        session_id: `session-local-${Date.now()}`,
        date: sessionData.date || '2026-10-27',
        time: sessionData.time || '07:00',
        location: sessionData.location || 'Praia Grande - São Sebastião',
        canoe_type: sessionData.canoe_type || 'OC6',
        total_capacity: sessionData.total_capacity || 6,
        booked_seats: 0,
        max_adapted_seats: sessionData.max_adapted_seats || 2,
        booked_adapted_seats: 0,
        status: 'OPEN',
        instructor_name: sessionData.instructor_name || 'Instrutor Local',
        notes: sessionData.notes
      };
      fallbackSessions.unshift(newSession);
      return newSession;
    }
  }

  async createReservation(sessionId: string, requiresAdapted: boolean, notes?: string): Promise<Reservation> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/reservations`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          requires_adapted_seat: requiresAdapted,
          notes
        })
      });
      this.checkAuthError(response);

      if (!response.ok) {
        const errJson = await response.json();
        if (response.status === 409) {
          throw new Error(`Conflito: ${errJson.message || 'Vagas esgotadas ou usuário já inscrito.'}`);
        }
        throw new Error(errJson.message || 'Erro ao agendar remada.');
      }
      return await response.json();
    } catch (e: any) {
      if (e.message?.includes('Conflito:')) {
        throw e;
      }
      // Fallback local
      const session = fallbackSessions.find((s) => s.session_id === sessionId);
      if (session) {
        if (session.booked_seats >= session.total_capacity) {
          throw new Error('Conflito: Capacidade total da canoa esgotada.');
        }
        if (requiresAdapted && session.booked_adapted_seats >= session.max_adapted_seats) {
          throw new Error('Conflito: Vagas de assentos adaptados esgotadas para esta remada.');
        }
        session.booked_seats += 1;
        if (requiresAdapted) session.booked_adapted_seats += 1;
        if (session.booked_seats >= session.total_capacity) session.status = 'FULL';
      }
      const newRes: Reservation = {
        reservation_id: `res-local-${Date.now()}`,
        session_id: sessionId,
        user_id: 'user-demo-me',
        user_name: 'Remador UniSENAI',
        user_email: 'remador@cpt.org',
        requires_adapted_seat: requiresAdapted,
        status: 'CONFIRMED',
        notes,
        created_at: new Date().toISOString()
      };
      fallbackReservations.push(newRes);
      return newRes;
    }
  }

  // --- Perfil do usuário ---
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: await this.getHeaders()
    });
    this.checkAuthError(response);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(data)
    });
    this.checkAuthError(response);
    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.message || 'Erro ao salvar perfil.');
    }
    return await response.json();
  }

  // --- Edição e status de sessão (Instrutor/Admin) ---
  async updateSession(sessionId: string, data: Partial<Session>): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(data)
    });
    this.checkAuthError(response);
    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.message || 'Erro ao editar remada.');
    }
    return await response.json();
  }

  async updateSessionStatus(sessionId: string, status: Session['status']): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ status })
    });
    this.checkAuthError(response);
    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.message || 'Erro ao alterar status da remada.');
    }
    return await response.json();
  }

  // --- Administração de usuários (só Admin) ---
  async adminListUsers(): Promise<AdminUser[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: await this.getHeaders()
    });
    this.checkAuthError(response);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  }

  async adminSetUserRole(userId: string, role: AdminUser['role']): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ role })
    });
    this.checkAuthError(response);
    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.message || 'Erro ao alterar role do usuário.');
    }
  }

  async getRecentActivity(): Promise<Reservation[]> {
    const response = await fetch(`${API_BASE_URL}/reservations/recent`, {
      method: 'GET',
      headers: await this.getHeaders()
    });
    this.checkAuthError(response);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  }

  async getSessionRoster(sessionId: string): Promise<Reservation[]> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/reservations`, {
      method: 'GET',
      headers: await this.getHeaders()
    });
    this.checkAuthError(response);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  }

  async getMyReservations(): Promise<Reservation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/me`, {
        method: 'GET',
        headers: await this.getHeaders()
      });
      this.checkAuthError(response);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch {
      const fallback = [...fallbackReservations];
      (fallback as any).__isFallback = true;
      return fallback;
    }
  }

  async cancelReservation(sessionId: string, userId: string = 'user-demo-me'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/reservations/${userId}`, {
        method: 'DELETE',
        headers: await this.getHeaders()
      });
      this.checkAuthError(response);
      if (!response.ok) throw new Error('Erro ao cancelar reserva.');
    } catch {
      const idx = fallbackReservations.findIndex((r) => r.session_id === sessionId && r.user_id === userId);
      if (idx !== -1) {
        const removed = fallbackReservations.splice(idx, 1)[0];
        const session = fallbackSessions.find((s) => s.session_id === sessionId);
        if (session && session.booked_seats > 0) {
          session.booked_seats -= 1;
          if (removed.requires_adapted_seat && session.booked_adapted_seats > 0) {
            session.booked_adapted_seats -= 1;
          }
          if (session.status === 'FULL') session.status = 'OPEN';
        }
      }
    }
  }
}

export const api = new ApiService();

