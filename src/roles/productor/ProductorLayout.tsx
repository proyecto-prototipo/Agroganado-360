import { Outlet } from 'react-router-dom';
import { RoleShell, icons } from '../../shared/ui';
import './productor.css';

const items = [
  { label: 'Dashboard', path: '/productor/dashboard', icon: icons.dashboard },
  { label: 'Ganado', path: '/productor/ganado', icon: icons.cattle },
  { label: 'Historial productivo', path: '/productor/productivo', icon: icons.productive },
  { label: 'Sanidad consulta', path: '/productor/sanidad', icon: icons.health },
  { label: 'Crowdfunding consulta', path: '/productor/crowdfunding', icon: icons.funding },
  { label: 'Trazabilidad', path: '/productor/trazabilidad', icon: icons.trace },
  { label: 'Clima', path: '/productor/clima', icon: icons.climate },
  { label: 'Reportes', path: '/productor/reportes', icon: icons.reports }
];

export default function ProductorLayout() {
  return <RoleShell role="productor" items={items}><Outlet /></RoleShell>;
}
