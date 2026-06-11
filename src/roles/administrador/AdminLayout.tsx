import { Outlet } from 'react-router-dom';
import { RoleShell, icons } from '../../shared/ui';
import './admin.css';

const items = [
  { label: 'Dashboard', path: '/administrador/dashboard', icon: icons.dashboard },
  { label: 'Usuarios', path: '/administrador/usuarios', icon: icons.users },
  { label: 'Ganado', path: '/administrador/ganado', icon: icons.cattle },
  { label: 'Historial productivo', path: '/administrador/productivo', icon: icons.productive },
  { label: 'Sanidad', path: '/administrador/sanidad', icon: icons.health },
  { label: 'Crowdfunding', path: '/administrador/crowdfunding', icon: icons.funding },
  { label: 'Inversiones', path: '/administrador/inversiones', icon: icons.file },
  { label: 'Trazabilidad', path: '/administrador/trazabilidad', icon: icons.trace },
  { label: 'Clima', path: '/administrador/clima', icon: icons.climate },
  { label: 'Reportes', path: '/administrador/reportes', icon: icons.reports },
  { label: 'Auditoría', path: '/administrador/auditoria', icon: icons.audit }
];

export default function AdminLayout() {
  return <RoleShell role="administrador" items={items}><Outlet /></RoleShell>;
}
