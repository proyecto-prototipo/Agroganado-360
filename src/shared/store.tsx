import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { initialState } from './data';
import type {
  AgroState,
  AuditLog,
  Cattle,
  ClimateRecord,
  HealthRecord,
  Investment,
  ProductiveRecord,
  Project,
  Role,
  TraceabilityEvent,
  UserProfile
} from './types';
import { createAuditInSupabase } from './auditService';

const STORAGE_KEY = 'agroganado360_state_v1';
const ROLE_KEY = 'agroganado360_role';
const MAX_CATTLE_IMAGES = 4;

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toLocaleString('es-PE', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}

function hash() {
  const date = new Date().toISOString().slice(0, 10).split('-').join('');
  return `AG360-${date}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

type Action =
  | { type: 'RESET' }
  | { type: 'ADD_AUDIT'; payload: AuditLog }
  | { type: 'UPSERT_USER'; payload: UserProfile }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'UPSERT_CATTLE'; payload: Cattle }
  | { type: 'DELETE_CATTLE'; payload: string }
  | { type: 'UPSERT_PRODUCTIVE'; payload: ProductiveRecord }
  | { type: 'DELETE_PRODUCTIVE'; payload: string }
  | { type: 'UPSERT_HEALTH'; payload: HealthRecord }
  | { type: 'DELETE_HEALTH'; payload: string }
  | { type: 'UPSERT_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_INVESTMENT'; payload: Investment }
  | { type: 'UPSERT_INVESTMENT'; payload: Investment }
  | { type: 'DELETE_INVESTMENT'; payload: string }
  | { type: 'UPSERT_TRACE'; payload: TraceabilityEvent }
  | { type: 'DELETE_TRACE'; payload: string }
  | { type: 'UPSERT_CLIMATE'; payload: ClimateRecord }
  | { type: 'DELETE_CLIMATE'; payload: string };

function upsert<T extends { id: string }>(items: T[], item: T) {
  return items.some((x) => x.id === item.id) ? items.map((x) => (x.id === item.id ? item : x)) : [item, ...items];
}

function reducer(state: AgroState, action: Action): AgroState {
  switch (action.type) {
    case 'RESET':
      return initialState;
    case 'ADD_AUDIT':
      return { ...state, audits: [action.payload, ...state.audits].slice(0, 80) };
    case 'UPSERT_USER':
      return { ...state, users: upsert(state.users, action.payload) };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter((x) => x.id !== action.payload) };
    case 'UPSERT_CATTLE':
      return { ...state, cattle: upsert(state.cattle, action.payload) };
    case 'DELETE_CATTLE':
      return { ...state, cattle: state.cattle.filter((x) => x.id !== action.payload) };
    case 'UPSERT_PRODUCTIVE':
      return { ...state, productiveRecords: upsert(state.productiveRecords, action.payload) };
    case 'DELETE_PRODUCTIVE':
      return { ...state, productiveRecords: state.productiveRecords.filter((x) => x.id !== action.payload) };
    case 'UPSERT_HEALTH':
      return { ...state, healthRecords: upsert(state.healthRecords, action.payload) };
    case 'DELETE_HEALTH':
      return { ...state, healthRecords: state.healthRecords.filter((x) => x.id !== action.payload) };
    case 'UPSERT_PROJECT':
      return { ...state, projects: upsert(state.projects, action.payload) };
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter((x) => x.id !== action.payload) };
    case 'ADD_INVESTMENT': {
      const investment = action.payload;
      const projects = state.projects.map((p) => {
        if (p.id !== investment.projectId) return p;
        const raised = Math.min(p.goalAmount, p.raisedAmount + investment.amount);
        return { ...p, raisedAmount: raised, status: raised >= p.goalAmount ? 'Financiado' : p.status } as Project;
      });
      return { ...state, projects, investments: [investment, ...state.investments] };
    }
    case 'UPSERT_INVESTMENT':
      return { ...state, investments: upsert(state.investments, action.payload) };
    case 'DELETE_INVESTMENT':
      return { ...state, investments: state.investments.filter((x) => x.id !== action.payload) };
    case 'UPSERT_TRACE':
      return { ...state, traceabilityEvents: upsert(state.traceabilityEvents, action.payload) };
    case 'DELETE_TRACE':
      return { ...state, traceabilityEvents: state.traceabilityEvents.filter((x) => x.id !== action.payload) };
    case 'UPSERT_CLIMATE':
      return { ...state, climateRecords: upsert(state.climateRecords, action.payload) };
    case 'DELETE_CLIMATE':
      return { ...state, climateRecords: state.climateRecords.filter((x) => x.id !== action.payload) };
    default:
      return state;
  }
}

interface AgroContextValue {
  state: AgroState;
  role: Role | null;
  setRole: (role: Role | null) => void;
  currentUser: string;
  notice: string;
  setNotice: (value: string) => void;
  resetData: () => void;
  createAudit: (action: string, module: string, description: string) => void;
  saveUser: (item: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  saveCattle: (item: Partial<Cattle>) => void;
  deleteCattle: (id: string) => void;
  saveProductive: (item: Partial<ProductiveRecord>) => void;
  deleteProductive: (id: string) => void;
  saveHealth: (item: Partial<HealthRecord>) => void;
  deleteHealth: (id: string) => void;
  saveProject: (item: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  invest: (project: Project, amount: number, investorName?: string) => void;
  saveInvestment: (item: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  saveTrace: (item: Partial<TraceabilityEvent>) => void;
  deleteTrace: (id: string) => void;
  saveClimate: (item: Partial<ClimateRecord>) => void;
  deleteClimate: (id: string) => void;
  simulateClimate: () => void;
  makeHash: () => string;
}

const AgroContext = createContext<AgroContextValue | null>(null);

export function AgroProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });
  const [roleState, setRoleState] = useState<Role | null>(() => (localStorage.getItem(ROLE_KEY) as Role | null) || null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const setRole = (role: Role | null) => {
    setRoleState(role);
    if (role) localStorage.setItem(ROLE_KEY, role);
    else localStorage.removeItem(ROLE_KEY);
  };

  const currentUser = useMemo(() => {
    if (!roleState) return 'Usuario demo';
    return state.users.find((u) => u.role === roleState)?.fullName || 'Usuario demo';
  }, [roleState, state.users]);

  const createAudit = (action: string, module: string, description: string) => {
  const audit = {
    id: id('AUD'),
    user: currentUser,
    action,
    module,
    description,
    createdAt: new Date().toISOString()
  };

  dispatch({
    type: 'ADD_AUDIT',
    payload: audit
  });

  createAuditInSupabase({
    user: audit.user,
    action: audit.action,
    module: audit.module,
    description: audit.description,
    createdAt: audit.createdAt
  }).catch((error) => {
    console.error('No se pudo guardar la auditoría en Supabase:', error);
  });
};

  const value: AgroContextValue = {
    state,
    role: roleState,
    setRole,
    currentUser,
    notice,
    setNotice,
    resetData: () => {
      dispatch({ type: 'RESET' });
      setNotice('Datos demo restaurados correctamente.');
    },
    createAudit,
    saveUser: (item) => {
      const fullItem: UserProfile = {
        id: item.id || id('USR'),
        fullName: item.fullName || 'Nuevo usuario',
        email: item.email || 'usuario@agro360.com',
        role: item.role || 'productor',
        phone: item.phone || '999 000 000',
        status: item.status || 'Activo',
        lastAccess: item.lastAccess || now()
      };
      dispatch({ type: 'UPSERT_USER', payload: fullItem });
      createAudit(item.id ? 'Actualización' : 'Creación', 'Gestión de Usuarios', `${fullItem.fullName} guardado.`);
      setNotice('Usuario guardado correctamente.');
    },
    deleteUser: (itemId) => {
      dispatch({ type: 'DELETE_USER', payload: itemId });
      createAudit('Eliminación', 'Gestión de Usuarios', `Usuario ${itemId} eliminado.`);
      setNotice('Usuario eliminado.');
    },
    saveCattle: (item) => {
      const fullItem: Cattle = {
        id: item.id || id('GAN'),
        code: item.code || `AG360-${Math.floor(Math.random() * 900 + 100)}`,
        name: item.name || 'Nuevo animal',
        breed: item.breed || 'Brown Swiss',
        sex: item.sex || 'Hembra',
        weight: Number(item.weight || 300),
        temperature: Number(item.temperature || 38.5),
        healthStatus: item.healthStatus || 'Sano',
        location: item.location || 'Potrero Norte',
        gps: item.gps || '-13.525,-71.967',
        funded: Boolean(item.funded),
        images: (item.images || []).slice(0, MAX_CATTLE_IMAGES),
        createdAt: item.createdAt || today()
      };

      dispatch({ type: 'UPSERT_CATTLE', payload: fullItem });
      createAudit(item.id ? 'Actualización' : 'Creación', 'Ganado', `${fullItem.code} guardado.`);
      setNotice('Registro de ganado guardado.');
    },
    deleteCattle: (itemId) => {
      dispatch({ type: 'DELETE_CATTLE', payload: itemId });
      createAudit('Eliminación', 'Ganado', `Registro ${itemId} eliminado.`);
      setNotice('Animal eliminado.');
    },
    saveProductive: (item) => {
      const fullItem: ProductiveRecord = {
        id: item.id || id('PROD'),
        cattleId: item.cattleId || state.cattle[0]?.id || 'GAN-001',
        recordDate: item.recordDate || today(),
        weight: Number(item.weight || 300),
        milkProduction: Number(item.milkProduction || 0),
        note: item.note || 'Registro productivo creado desde el PMV.'
      };
      dispatch({ type: 'UPSERT_PRODUCTIVE', payload: fullItem });
      createAudit(item.id ? 'Actualización' : 'Creación', 'Historial Productivo', `Registro ${fullItem.id} guardado.`);
      setNotice('Historial productivo guardado.');
    },
    deleteProductive: (itemId) => {
      dispatch({ type: 'DELETE_PRODUCTIVE', payload: itemId });
      createAudit('Eliminación', 'Historial Productivo', `Registro ${itemId} eliminado.`);
      setNotice('Registro productivo eliminado.');
    },
    saveHealth: (item) => {
      const fullItem: HealthRecord = {
        id: item.id || id('SAN'),
        cattleId: item.cattleId || state.cattle[0]?.id || 'GAN-001',
        diagnosis: item.diagnosis || 'Control preventivo',
        treatment: item.treatment || 'Seguimiento sanitario',
        vaccine: item.vaccine || 'No aplica',
        nextCheckup: item.nextCheckup || today(),
        status: item.status || 'Pendiente',
        createdAt: item.createdAt || today()
      };
      dispatch({ type: 'UPSERT_HEALTH', payload: fullItem });
      createAudit(item.id ? 'Actualización' : 'Creación', 'Gestión Sanitaria', `Registro sanitario ${fullItem.id} guardado.`);
      setNotice('Registro sanitario guardado.');
    },
    deleteHealth: (itemId) => {
      dispatch({ type: 'DELETE_HEALTH', payload: itemId });
      createAudit('Eliminación', 'Gestión Sanitaria', `Registro ${itemId} eliminado.`);
      setNotice('Registro sanitario eliminado.');
    },
    saveProject: (item) => {
      const goal = Number(item.goalAmount || 10000);
      const raised = Number(item.raisedAmount || 0);
      const fullItem: Project = {
        id: item.id || id('PROY'),
        title: item.title || 'Nuevo proyecto ganadero',
        description: item.description || 'Proyecto de financiamiento ganadero sostenible.',
        cattleId: item.cattleId || state.cattle[0]?.id || 'GAN-001',
        goalAmount: goal,
        raisedAmount: Math.min(goal, raised),
        projectedReturn: Number(item.projectedReturn || 10),
        status: item.status || (raised >= goal ? 'Financiado' : 'Activo'),
        endDate: item.endDate || today()
      };
      dispatch({ type: 'UPSERT_PROJECT', payload: fullItem });
      createAudit(item.id ? 'Actualización' : 'Creación', 'Crowdfunding', `${fullItem.title} guardado.`);
      setNotice('Proyecto guardado.');
    },
    deleteProject: (itemId) => {
      dispatch({ type: 'DELETE_PROJECT', payload: itemId });
      createAudit('Eliminación', 'Crowdfunding', `Proyecto ${itemId} eliminado.`);
      setNotice('Proyecto eliminado.');
    },
    invest: (project, amount, investorName) => {
      const expectedReturn = amount + amount * (project.projectedReturn / 100);
      const investment: Investment = {
        id: id('INV'),
        projectId: project.id,
        investorName: investorName || currentUser,
        amount,
        expectedReturn,
        status: 'En seguimiento',
        createdAt: today()
      };
      dispatch({ type: 'ADD_INVESTMENT', payload: investment });
      dispatch({
        type: 'UPSERT_TRACE',
        payload: {
          id: id('TRZ'),
          cattleId: project.cattleId,
          investmentId: investment.id,
          eventType: 'Inversión registrada',
          description: `Aporte de S/ ${amount.toLocaleString('es-PE')} registrado en ${project.title}.`,
          hashCode: hash(),
          createdAt: now()
        }
      });
      createAudit('Creación', 'Seguimiento de Inversiones', `Inversión de S/ ${amount.toLocaleString('es-PE')} registrada.`);
      setNotice('Inversión simulada correctamente.');
    },
    saveInvestment: (item) => {
      const project = state.projects.find((p) => p.id === item.projectId) || state.projects[0];
      const amount = Number(item.amount || 1000);
      const fullItem: Investment = {
        id: item.id || id('INV'),
        projectId: item.projectId || project?.id || 'PROY-001',
        investorName: item.investorName || currentUser,
        amount,
        expectedReturn: Number(item.expectedReturn || amount + amount * ((project?.projectedReturn || 10) / 100)),
        status: item.status || 'Registrado',
        createdAt: item.createdAt || today()
      };
      dispatch({ type: 'UPSERT_INVESTMENT', payload: fullItem });
      createAudit(item.id ? 'Actualización' : 'Creación', 'Inversiones', `${fullItem.id} guardada.`);
      setNotice('Inversión guardada.');
    },
    deleteInvestment: (itemId) => {
      dispatch({ type: 'DELETE_INVESTMENT', payload: itemId });
      createAudit('Eliminación', 'Inversiones', `Inversión ${itemId} eliminada.`);
      setNotice('Inversión eliminada.');
    },
    saveTrace: (item) => {
      const fullItem: TraceabilityEvent = {
        id: item.id || id('TRZ'),
        cattleId: item.cattleId || state.cattle[0]?.id || 'GAN-001',
        investmentId: item.investmentId,
        eventType: item.eventType || 'Evento de trazabilidad',
        description: item.description || 'Evidencia digital registrada en el PMV.',
        hashCode: item.hashCode || hash(),
        createdAt: item.createdAt || now()
      };
      dispatch({ type: 'UPSERT_TRACE', payload: fullItem });
      createAudit(item.id ? 'Actualización' : 'Creación', 'Trazabilidad Blockchain', `${fullItem.hashCode} registrado.`);
      setNotice('Evento de trazabilidad guardado.');
    },
    deleteTrace: (itemId) => {
      dispatch({ type: 'DELETE_TRACE', payload: itemId });
      createAudit('Eliminación', 'Trazabilidad Blockchain', `Evento ${itemId} eliminado.`);
      setNotice('Evento eliminado.');
    },
    saveClimate: (item) => {
      const fullItem: ClimateRecord = {
        id: item.id || id('CLI'),
        temperature: Number(item.temperature || 22),
        humidity: Number(item.humidity || 60),
        rainfall: Number(item.rainfall || 0),
        eventType: item.eventType || 'Normal',
        location: item.location || 'Potrero Norte',
        createdAt: item.createdAt || now()
      };
      dispatch({ type: 'UPSERT_CLIMATE', payload: fullItem });
      createAudit(item.id ? 'Actualización' : 'Creación', 'Monitoreo Climático', `${fullItem.location} registrado.`);
      setNotice('Registro climático guardado.');
    },
    deleteClimate: (itemId) => {
      dispatch({ type: 'DELETE_CLIMATE', payload: itemId });
      createAudit('Eliminación', 'Monitoreo Climático', `Registro ${itemId} eliminado.`);
      setNotice('Registro climático eliminado.');
    },
    simulateClimate: () => {
      const temperature = Number((Math.random() * 12 + 16).toFixed(1));
      const humidity = Math.round(Math.random() * 45 + 45);
      const rainfall = Number((Math.random() * 18).toFixed(1));
      const eventType: ClimateRecord['eventType'] = temperature > 26 ? 'Calor extremo' : rainfall > 9 ? 'Lluvia' : humidity < 50 ? 'Sequía' : 'Normal';
      const record: ClimateRecord = {
        id: id('CLI'), temperature, humidity, rainfall, eventType,
        location: ['Potrero Norte', 'Potrero Sur', 'Potrero Este'][Math.floor(Math.random() * 3)],
        createdAt: now()
      };
      dispatch({ type: 'UPSERT_CLIMATE', payload: record });
      createAudit('Simulación IoT', 'Monitoreo Climático', `Sensor simuló ${temperature}°C y ${humidity}% humedad.`);
      setNotice('Sensor climático simulado.');
    },
    makeHash: hash
  };

  return <AgroContext.Provider value={value}>{children}</AgroContext.Provider>;
}

export function useAgro() {
  const context = useContext(AgroContext);
  if (!context) throw new Error('useAgro debe usarse dentro de AgroProvider');
  return context;
}
