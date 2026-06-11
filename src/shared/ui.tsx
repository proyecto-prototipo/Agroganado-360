import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Bell,
  ChevronRight,
  CloudSun,
  Coins,
  FileText,
  Fingerprint,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Users,
  X
} from 'lucide-react';
import { useAgro } from './store';
import { roleNames } from './permissions';
import type { Role } from './types';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const icons = {
  dashboard: <Home size={18} />,
  users: <Users size={18} />,
  cattle: <Sprout size={18} />,
  productive: <Activity size={18} />,
  health: <HeartPulse size={18} />,
  funding: <Coins size={18} />,
  trace: <Fingerprint size={18} />,
  climate: <CloudSun size={18} />,
  reports: <BarChart3 size={18} />,
  audit: <ShieldCheck size={18} />,
  file: <FileText size={18} />
};

export function RoleShell({ role, items, children }: { role: Role; items: NavItem[]; children: React.ReactNode }) {
  const { setRole, notice, currentUser, resetData } = useAgro();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    setRole(null);
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Sprout size={24} /></div>
          <div>
            <b>AgroGanado 360</b>
            <span>PMV SaaS AgroTech</span>
          </div>
        </div>

        <div className="role-card">
          <span>Rol activo</span>
          <strong>{roleNames[role]}</strong>
          <small>{currentUser}</small>
        </div>

        <nav className="nav-list">
          {items.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
              {item.icon}
              <span>{item.label}</span>
              <ChevronRight size={15} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={17} /> Cerrar sesión
        </button>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <div>
            <p className="eyebrow">Panel operativo</p>
            <h1>{roleNames[role]}</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-dot"><Bell size={16} /> Sistema demo activo</span>
          </div>
        </header>

        <main>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
            {children}
          </motion.div>
        </main>
      </div>

      <nav className="mobile-bottom-nav">
        {items.slice(0, 5).map((item) => (
          <NavLink key={item.path} to={item.path}>{item.icon}<span>{item.label.split(' ')[0]}</span></NavLink>
        ))}
      </nav>

      {mobileOpen && <button aria-label="Cerrar menú" className="overlay" onClick={() => setMobileOpen(false)} />}
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">AgroGanado 360</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}

export function KpiCard({ title, value, helper, icon }: { title: string; value: string | number; helper: string; icon: React.ReactNode }) {
  return (
    <motion.div className="kpi-card" whileHover={{ translateY: -4 }}>
      <div className="kpi-icon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </motion.div>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <motion.div className="modal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <Sprout size={42} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const kind = normalized.includes('sano') || normalized.includes('activo') || normalized.includes('controlado') || normalized.includes('financiado') || normalized.includes('normal')
    ? 'success'
    : normalized.includes('urgente') || normalized.includes('alerta') || normalized.includes('calor')
      ? 'danger'
      : 'warning';
  return <span className={`badge ${kind}`}>{value}</span>;
}

export function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="progress-wrap">
      <div className="progress-top"><span>{pct}% financiado</span><b>S/ {value.toLocaleString('es-PE')}</b></div>
      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
      <small>Meta: S/ {max.toLocaleString('es-PE')}</small>
    </div>
  );
}

export function ConfirmButton({ label, message, onConfirm, disabled }: { label: string; message: string; onConfirm: () => void; disabled?: boolean }) {
  return (
    <button className="danger-btn" disabled={disabled} onClick={() => { if (window.confirm(message)) onConfirm(); }}>
      {label}
    </button>
  );
}

export function ReadOnlyNotice() {
  return <div className="readonly-notice">Tu rol tiene permiso de consulta. Las acciones de edición están bloqueadas visualmente.</div>;
}

export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
