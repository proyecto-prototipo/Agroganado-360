import { Outlet } from 'react-router-dom';
import { RoleShell, icons } from '../../shared/ui';
import './veterinario.css';

const items = [
  { label: 'Dashboard', path: '/veterinario/dashboard', icon: icons.dashboard },
  { label: 'Sanidad', path: '/veterinario/sanidad', icon: icons.health },
  { label: 'Ganado consulta', path: '/veterinario/ganado', icon: icons.cattle },
  { label: 'Productivo consulta', path: '/veterinario/productivo', icon: icons.productive },
  { label: 'Trazabilidad', path: '/veterinario/trazabilidad', icon: icons.trace },
  { label: 'Clima', path: '/veterinario/clima', icon: icons.climate },
  { label: 'Reportes', path: '/veterinario/reportes', icon: icons.reports }
];

export default function VeterinarioLayout() {
  return <RoleShell role="veterinario" items={items}><Outlet /></RoleShell>;
}
