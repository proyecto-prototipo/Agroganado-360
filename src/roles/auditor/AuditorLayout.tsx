import { Outlet } from 'react-router-dom';
import { RoleShell, icons } from '../../shared/ui';
import './auditor.css';

const items = [
  { label: 'Dashboard', path: '/auditor/dashboard', icon: icons.dashboard },
  { label: 'Trazabilidad', path: '/auditor/trazabilidad', icon: icons.trace },
  { label: 'Ganado consulta', path: '/auditor/ganado', icon: icons.cattle },
  { label: 'Inversiones consulta', path: '/auditor/inversiones', icon: icons.file },
  { label: 'Clima', path: '/auditor/clima', icon: icons.climate },
  { label: 'Reportes', path: '/auditor/reportes', icon: icons.reports },
  { label: 'Auditoría', path: '/auditor/auditoria', icon: icons.audit }
];

export default function AuditorLayout() {
  return <RoleShell role="auditor" items={items}><Outlet /></RoleShell>;
}
