import { Outlet } from 'react-router-dom';
import { RoleShell, icons } from '../../shared/ui';
import './inversionista.css';

const items = [
  { label: 'Dashboard', path: '/inversionista/dashboard', icon: icons.dashboard },
  { label: 'Proyectos', path: '/inversionista/proyectos', icon: icons.funding },
  { label: 'Mis inversiones', path: '/inversionista/inversiones', icon: icons.file },
  { label: 'Ganado consulta', path: '/inversionista/ganado', icon: icons.cattle },
  { label: 'Trazabilidad', path: '/inversionista/trazabilidad', icon: icons.trace },
  { label: 'Clima', path: '/inversionista/clima', icon: icons.climate },
  { label: 'Reportes', path: '/inversionista/reportes', icon: icons.reports }
];

export default function InversionistaLayout() {
  return <RoleShell role="inversionista" items={items}><Outlet /></RoleShell>;
}
