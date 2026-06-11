import { CSSProperties, ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  CloudSun,
  Coins,
  Database,
  EyeOff,
  Fingerprint,
  HeartPulse,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sprout
} from 'lucide-react';

import { useAgro } from '../shared/store';
import type { Role } from '../shared/types';
import { roleNames } from '../shared/permissions';
import fondo from '../assets/fondo.png';

const roles: Array<{ role: Role; icon: ReactNode; description: string }> = [
  {
    role: 'administrador',
    icon: <ShieldCheck size={20} />,
    description: 'Control total de usuarios, módulos, reportes y auditoría.'
  },
  {
    role: 'productor',
    icon: <Sprout size={20} />,
    description: 'Gestiona ganado, producción, clima y trazabilidad.'
  },
  {
    role: 'inversionista',
    icon: <Coins size={20} />,
    description: 'Consulta proyectos, invierte y sigue rendimiento.'
  },
  {
    role: 'veterinario',
    icon: <HeartPulse size={20} />,
    description: 'Registra sanidad, vacunas y controles técnicos.'
  },
  {
    role: 'auditor',
    icon: <Fingerprint size={20} />,
    description: 'Consulta historial, reportes y evidencias digitales.'
  }
];

const heroFeatures = [
  {
    icon: <BarChart3 size={22} />,
    title: 'Decisiones',
    text: 'basadas en datos'
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Información segura',
    text: 'y confiable'
  },
  {
    icon: <CloudSun size={22} />,
    title: 'Visión climática',
    text: 'en tiempo real'
  },
  {
    icon: <Database size={22} />,
    title: 'Todo en un solo',
    text: 'lugar'
  }
];

export default function Login() {
  const { setRole, createAudit } = useAgro();
  const navigate = useNavigate();

  const [email, setEmail] = useState('demo@agro360.com');
  const [password, setPassword] = useState('123456');
  const [selectedRole, setSelectedRole] = useState<Role>('administrador');

  const enter = (role: Role) => {
    setRole(role);
    createAudit('Inicio de sesión', 'Seguridad', `Acceso demo como ${roleNames[role]}.`);
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="login-v2-page">
      <section
        className="login-v2-hero"
        style={{ '--hero-bg': `url(${fondo})` } as CSSProperties}
      >
        <div className="login-v2-hero-shadow" />

        <div className="login-v2-brand">
          <div className="login-v2-brand-mark">
            <Sprout size={28} />
          </div>

          <div className="login-v2-brand-copy">
            <strong>AgroGanado 360</strong>
            <span>Producción · Financiamiento · Trazabilidad</span>
          </div>
        </div>

        <motion.div
          className="login-v2-hero-content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1>
            Gestión ganadera
            <br />
            inteligente con
            <br />
            visión productiva,
            <br />
            financiera
            <br />
            y climática.
          </h1>

          <span className="login-v2-accent-line" />

          <p>
            Una plataforma moderna para monitorear ganado, registrar sanidad,
            gestionar inversiones y tomar decisiones con información clara,
            visual y centralizada.
          </p>

          <div className="login-v2-feature-row">
            {heroFeatures.map((item) => (
              <div key={item.title} className="login-v2-feature-item">
                <div className="login-v2-feature-icon">{item.icon}</div>

                <div className="login-v2-feature-text">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="login-v2-panel">
        <motion.div
          className="login-v2-form-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="login-v2-card-top">
            <span className="login-v2-security-badge">
              <Lock size={15} />
              ACCESO SEGURO
            </span>

            <div className="login-v2-cow-badge">🐄</div>
          </div>

          <h2>Bienvenid@</h2>

          <p className="login-v2-form-description">
            Usa el acceso demo o escribe tus datos cuando conectes Supabase Auth.
          </p>

          <div className="login-v2-demo-select">
            <span>Demo sugerido</span>

            <label className="login-v2-role-select">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
              >
                {roles.map((item) => (
                  <option key={item.role} value={item.role}>
                    {roleNames[item.role]}
                  </option>
                ))}
              </select>

              <ChevronDown size={16} />
            </label>
          </div>

          <label className="login-v2-field">
            <span>Email</span>

            <div className="login-v2-input-wrap">
              <Mail size={18} />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
              />
            </div>
          </label>

          <label className="login-v2-field">
            <span>Contraseña</span>

            <div className="login-v2-input-wrap">
              <Lock size={18} />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />

              <EyeOff size={18} className="login-v2-input-right-icon" />
            </div>
          </label>

          <button className="login-v2-submit" onClick={() => enter(selectedRole)}>
            <LogIn size={18} />
            Ingresar demo como {roleNames[selectedRole].toLowerCase()}
          </button>

          <div className="login-v2-form-footer">
            <Link className="login-v2-forgot" to="/recover">
              ¿Olvidaste tu contraseña?
            </Link>

            <span className="login-v2-ready-badge">
              <span className="ready-dot" />
              Supabase Ready
            </span>
          </div>
        </motion.div>

        <div className="login-v2-roles-block">
          <div className="login-v2-roles-header">
            <h3>Ingresar por rol</h3>
            <p>Explora el prototipo desde diferentes perfiles operativos.</p>
          </div>

          <div className="login-v2-roles-grid">
            {roles.map((item) => (
              <button
                key={item.role}
                className="login-v2-role-card"
                onClick={() => enter(item.role)}
              >
                <div className="login-v2-role-icon">{item.icon}</div>

                <div className="login-v2-role-copy">
                  <strong>{roleNames[item.role]}</strong>
                  <small>{item.description}</small>
                </div>

                <ArrowRight size={18} className="login-v2-role-arrow" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}