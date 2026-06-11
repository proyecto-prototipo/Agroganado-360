import type { Access, Role } from './types';

export const roleNames: Record<Role, string> = {
  administrador: 'Administrador del Sistema',
  productor: 'Productor Ganadero',
  inversionista: 'Inversionista',
  veterinario: 'Veterinario/Técnico',
  auditor: 'Auditor'
};

export const permissions: Record<Role, Record<string, Access>> = {
  administrador: {
    usuarios: 'crud', ganado: 'crud', productivo: 'crud', sanidad: 'crud', crowdfunding: 'crud',
    inversiones: 'crud', trazabilidad: 'crud', clima: 'crud', reportes: 'crud', auditoria: 'crud'
  },
  productor: {
    usuarios: 'consulta', ganado: 'crud', productivo: 'crud', sanidad: 'consulta', crowdfunding: 'consulta',
    inversiones: 'consulta', trazabilidad: 'consulta', clima: 'consulta', reportes: 'consulta', auditoria: 'no'
  },
  inversionista: {
    usuarios: 'consulta', ganado: 'consulta', productivo: 'consulta', sanidad: 'consulta', crowdfunding: 'crud',
    inversiones: 'consulta', trazabilidad: 'consulta', clima: 'consulta', reportes: 'consulta', auditoria: 'no'
  },
  veterinario: {
    usuarios: 'consulta', ganado: 'consulta', productivo: 'consulta', sanidad: 'crud', crowdfunding: 'no',
    inversiones: 'no', trazabilidad: 'consulta', clima: 'consulta', reportes: 'consulta', auditoria: 'no'
  },
  auditor: {
    usuarios: 'consulta', ganado: 'consulta', productivo: 'consulta', sanidad: 'consulta', crowdfunding: 'consulta',
    inversiones: 'consulta', trazabilidad: 'consulta', clima: 'consulta', reportes: 'consulta', auditoria: 'consulta'
  }
};

export function can(role: Role, module: string) {
  return permissions[role]?.[module] ?? 'no';
}
