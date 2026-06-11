export type Role = 'administrador' | 'productor' | 'inversionista' | 'veterinario' | 'auditor';
export type Access = 'crud' | 'consulta' | 'no';

export type UserStatus = 'Activo' | 'Suspendido' | 'Pendiente';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phone: string;
  status: UserStatus;
  lastAccess: string;
}

export interface Cattle {
  id: string;
  code: string;
  name: string;
  breed: string;
  sex: 'Hembra' | 'Macho';
  weight: number;
  temperature: number;
  healthStatus: 'Sano' | 'En observación' | 'Alerta sanitaria' | 'Tratamiento';
  location: string;
  gps: string;
  funded: boolean;
  images?: string[];
  createdAt?: string;
}

export interface ProductiveRecord {
  id: string;
  cattleId: string;
  recordDate: string;
  weight: number;
  milkProduction: number;
  note: string;
}

export interface HealthRecord {
  id: string;
  cattleId: string;
  diagnosis: string;
  treatment: string;
  vaccine: string;
  nextCheckup: string;
  status: 'Controlado' | 'Pendiente' | 'Urgente';
  createdAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  cattleId: string;
  goalAmount: number;
  raisedAmount: number;
  projectedReturn: number;
  status: 'Activo' | 'Financiado' | 'Cerrado';
  endDate: string;
  createdAt?: string;
}

export interface Investment {
  id: string;
  projectId: string;
  investorName: string;
  amount: number;
  expectedReturn: number;
  status: 'Registrado' | 'En seguimiento' | 'Liquidado';
  createdAt: string;
}

export interface TraceabilityEvent {
  id: string;
  cattleId: string;
  investmentId?: string;
  eventType: string;
  description: string;
  hashCode: string;
  createdAt: string;
}

export interface ClimateRecord {
  id: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  eventType: 'Normal' | 'Lluvia' | 'Sequía' | 'Calor extremo' | 'Frío';
  location: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  description: string;
  createdAt: string;
}

export interface AgroState {
  users: UserProfile[];
  cattle: Cattle[];
  productiveRecords: ProductiveRecord[];
  healthRecords: HealthRecord[];
  projects: Project[];
  investments: Investment[];
  traceabilityEvents: TraceabilityEvent[];
  climateRecords: ClimateRecord[];
  audits: AuditLog[];
}
