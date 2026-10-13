/**
 * Perfis de acesso do app (espelha backend/common/models.py).
 * INSTRUCTOR é legado e é tratado igual a LEME.
 */
export type Role = 'ATHLETE' | 'LEME' | 'INSTRUCTOR' | 'ADMIN';

export const ASSIGNABLE_ROLES: Role[] = ['ATHLETE', 'LEME', 'ADMIN'];

export function isPrivilegedRole(role?: string | null): boolean {
  return role === 'LEME' || role === 'INSTRUCTOR' || role === 'ADMIN';
}

export function roleLabel(role?: string | null): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'LEME':
    case 'INSTRUCTOR':
      return 'Leme';
    default:
      return 'Remador';
  }
}
