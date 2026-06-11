import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './auth/Login';
import RecoverPassword from './auth/RecoverPassword';
import { useAgro } from './shared/store';
import type { Role } from './shared/types';

import AdminLayout from './roles/administrador/AdminLayout';
import AdminDashboard from './roles/administrador/Dashboard';
import AdminUsuarios from './roles/administrador/Usuarios';
import AdminGanado from './roles/administrador/Ganado';
import AdminProductivo from './roles/administrador/HistorialProductivo';
import AdminSanidad from './roles/administrador/Sanidad';
import AdminCrowdfunding from './roles/administrador/Crowdfunding';
import AdminInversiones from './roles/administrador/Inversiones';
import AdminTrazabilidad from './roles/administrador/Trazabilidad';
import AdminClima from './roles/administrador/Clima';
import AdminReportes from './roles/administrador/Reportes';
import AdminAuditoria from './roles/administrador/Auditoria';

import ProductorLayout from './roles/productor/ProductorLayout';
import ProductorDashboard from './roles/productor/Dashboard';
import ProductorGanado from './roles/productor/Ganado';
import ProductorProductivo from './roles/productor/HistorialProductivo';
import ProductorSanidad from './roles/productor/SanidadConsulta';
import ProductorCrowdfunding from './roles/productor/CrowdfundingConsulta';
import ProductorTrazabilidad from './roles/productor/Trazabilidad';
import ProductorClima from './roles/productor/Clima';
import ProductorReportes from './roles/productor/Reportes';

import InversionistaLayout from './roles/inversionista/InversionistaLayout';
import InversionistaDashboard from './roles/inversionista/Dashboard';
import InversionistaProyectos from './roles/inversionista/Proyectos';
import InversionistaInversiones from './roles/inversionista/MisInversiones';
import InversionistaGanado from './roles/inversionista/GanadoConsulta';
import InversionistaTrazabilidad from './roles/inversionista/Trazabilidad';
import InversionistaClima from './roles/inversionista/Clima';
import InversionistaReportes from './roles/inversionista/Reportes';

import VeterinarioLayout from './roles/veterinario/VeterinarioLayout';
import VeterinarioDashboard from './roles/veterinario/Dashboard';
import VeterinarioSanidad from './roles/veterinario/Sanidad';
import VeterinarioGanado from './roles/veterinario/GanadoConsulta';
import VeterinarioProductivo from './roles/veterinario/ProductivoConsulta';
import VeterinarioTrazabilidad from './roles/veterinario/Trazabilidad';
import VeterinarioClima from './roles/veterinario/Clima';
import VeterinarioReportes from './roles/veterinario/Reportes';

import AuditorLayout from './roles/auditor/AuditorLayout';
import AuditorDashboard from './roles/auditor/Dashboard';
import AuditorTrazabilidad from './roles/auditor/Trazabilidad';
import AuditorGanado from './roles/auditor/GanadoConsulta';
import AuditorInversiones from './roles/auditor/InversionesConsulta';
import AuditorClima from './roles/auditor/Clima';
import AuditorReportes from './roles/auditor/Reportes';
import AuditorAuditoria from './roles/auditor/Auditoria';

function Guard({ expected, children }: { expected: Role; children: ReactElement }) {
  const { role } = useAgro();
  if (!role) return <Navigate to="/login" replace />;
  if (role !== expected) return <Navigate to={`/${role}/dashboard`} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recover" element={<RecoverPassword />} />

      <Route path="/administrador" element={<Guard expected="administrador"><AdminLayout /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="ganado" element={<AdminGanado />} />
        <Route path="productivo" element={<AdminProductivo />} />
        <Route path="sanidad" element={<AdminSanidad />} />
        <Route path="crowdfunding" element={<AdminCrowdfunding />} />
        <Route path="inversiones" element={<AdminInversiones />} />
        <Route path="trazabilidad" element={<AdminTrazabilidad />} />
        <Route path="clima" element={<AdminClima />} />
        <Route path="reportes" element={<AdminReportes />} />
        <Route path="auditoria" element={<AdminAuditoria />} />
      </Route>

      <Route path="/productor" element={<Guard expected="productor"><ProductorLayout /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProductorDashboard />} />
        <Route path="ganado" element={<ProductorGanado />} />
        <Route path="productivo" element={<ProductorProductivo />} />
        <Route path="sanidad" element={<ProductorSanidad />} />
        <Route path="crowdfunding" element={<ProductorCrowdfunding />} />
        <Route path="trazabilidad" element={<ProductorTrazabilidad />} />
        <Route path="clima" element={<ProductorClima />} />
        <Route path="reportes" element={<ProductorReportes />} />
      </Route>

      <Route path="/inversionista" element={<Guard expected="inversionista"><InversionistaLayout /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InversionistaDashboard />} />
        <Route path="proyectos" element={<InversionistaProyectos />} />
        <Route path="inversiones" element={<InversionistaInversiones />} />
        <Route path="ganado" element={<InversionistaGanado />} />
        <Route path="trazabilidad" element={<InversionistaTrazabilidad />} />
        <Route path="clima" element={<InversionistaClima />} />
        <Route path="reportes" element={<InversionistaReportes />} />
      </Route>

      <Route path="/veterinario" element={<Guard expected="veterinario"><VeterinarioLayout /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VeterinarioDashboard />} />
        <Route path="sanidad" element={<VeterinarioSanidad />} />
        <Route path="ganado" element={<VeterinarioGanado />} />
        <Route path="productivo" element={<VeterinarioProductivo />} />
        <Route path="trazabilidad" element={<VeterinarioTrazabilidad />} />
        <Route path="clima" element={<VeterinarioClima />} />
        <Route path="reportes" element={<VeterinarioReportes />} />
      </Route>

      <Route path="/auditor" element={<Guard expected="auditor"><AuditorLayout /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AuditorDashboard />} />
        <Route path="trazabilidad" element={<AuditorTrazabilidad />} />
        <Route path="ganado" element={<AuditorGanado />} />
        <Route path="inversiones" element={<AuditorInversiones />} />
        <Route path="clima" element={<AuditorClima />} />
        <Route path="reportes" element={<AuditorReportes />} />
        <Route path="auditoria" element={<AuditorAuditoria />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
