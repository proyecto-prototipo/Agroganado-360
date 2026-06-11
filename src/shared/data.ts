import type { AgroState } from './types';

export const initialState: AgroState = {
  users: [
    { id: 'USR-001', fullName: 'María Soto', email: 'admin@agro360.com', role: 'administrador', phone: '999 111 222', status: 'Activo', lastAccess: '2026-06-08 09:10' },
    { id: 'USR-002', fullName: 'Carlos Huamán', email: 'productor@agro360.com', role: 'productor', phone: '999 222 333', status: 'Activo', lastAccess: '2026-06-07 18:20' },
    { id: 'USR-003', fullName: 'Ana Torres', email: 'inversionista@agro360.com', role: 'inversionista', phone: '999 333 444', status: 'Activo', lastAccess: '2026-06-08 11:45' },
    { id: 'USR-004', fullName: 'Dr. Luis Paredes', email: 'veterinario@agro360.com', role: 'veterinario', phone: '999 444 555', status: 'Activo', lastAccess: '2026-06-06 16:30' },
    { id: 'USR-005', fullName: 'Elena Ríos', email: 'auditor@agro360.com', role: 'auditor', phone: '999 555 666', status: 'Pendiente', lastAccess: '2026-06-05 14:00' }
  ],
  cattle: [
    { id: 'GAN-001', code: 'AG360-001', name: 'Toro Cenizo', breed: 'Brown Swiss', sex: 'Macho', weight: 420, temperature: 38.5, healthStatus: 'Sano', location: 'Potrero Norte', gps: '-13.525,-71.967', funded: true, createdAt: '2026-05-22' },
    { id: 'GAN-002', code: 'AG360-002', name: 'Vaca Esperanza', breed: 'Holstein', sex: 'Hembra', weight: 360, temperature: 39.1, healthStatus: 'En observación', location: 'Potrero Sur', gps: '-13.527,-71.962', funded: false, createdAt: '2026-05-25' },
    { id: 'GAN-003', code: 'AG360-003', name: 'Novillo Verde', breed: 'Jersey', sex: 'Macho', weight: 285, temperature: 38.9, healthStatus: 'Tratamiento', location: 'Corral Técnico', gps: '-13.520,-71.960', funded: true, createdAt: '2026-05-27' },
    { id: 'GAN-004', code: 'AG360-004', name: 'Luna', breed: 'Simmental', sex: 'Hembra', weight: 390, temperature: 38.3, healthStatus: 'Sano', location: 'Potrero Este', gps: '-13.521,-71.971', funded: false, createdAt: '2026-06-01' }
  ],
  productiveRecords: [
    { id: 'PROD-001', cattleId: 'GAN-001', recordDate: '2026-06-01', weight: 420, milkProduction: 0, note: 'Peso estable para fase de engorde.' },
    { id: 'PROD-002', cattleId: 'GAN-002', recordDate: '2026-06-02', weight: 360, milkProduction: 18, note: 'Producción dentro del rango esperado.' },
    { id: 'PROD-003', cattleId: 'GAN-004', recordDate: '2026-06-03', weight: 390, milkProduction: 21, note: 'Buena conversión alimenticia.' }
  ],
  healthRecords: [
    { id: 'SAN-001', cattleId: 'GAN-002', diagnosis: 'Ligera fiebre', treatment: 'Observación y control de temperatura', vaccine: 'Refuerzo clostridial', nextCheckup: '2026-06-12', status: 'Pendiente', createdAt: '2026-06-05' },
    { id: 'SAN-002', cattleId: 'GAN-003', diagnosis: 'Herida superficial', treatment: 'Curación local y antibiótico', vaccine: 'No aplica', nextCheckup: '2026-06-10', status: 'Controlado', createdAt: '2026-06-03' },
    { id: 'SAN-003', cattleId: 'GAN-001', diagnosis: 'Control preventivo', treatment: 'Vitaminización', vaccine: 'Aftosa', nextCheckup: '2026-07-01', status: 'Controlado', createdAt: '2026-05-31' }
  ],
  projects: [
    { id: 'PROY-001', title: 'Engorde sostenible lote Cenizo', description: 'Financiamiento para alimentación, control sanitario y trazabilidad del lote premium.', cattleId: 'GAN-001', goalAmount: 25000, raisedAmount: 14500, projectedReturn: 14, status: 'Activo', endDate: '2026-08-30' },
    { id: 'PROY-002', title: 'Producción lechera eficiente', description: 'Proyecto para mejorar producción y control de indicadores de vacas lecheras.', cattleId: 'GAN-002', goalAmount: 18000, raisedAmount: 18000, projectedReturn: 12, status: 'Financiado', endDate: '2026-07-20' },
    { id: 'PROY-003', title: 'Sanidad y recuperación de novillos', description: 'Seguimiento técnico veterinario con trazabilidad digital para recuperación productiva.', cattleId: 'GAN-003', goalAmount: 12000, raisedAmount: 5000, projectedReturn: 10, status: 'Activo', endDate: '2026-09-15' }
  ],
  investments: [
    { id: 'INV-001', projectId: 'PROY-001', investorName: 'Ana Torres', amount: 6500, expectedReturn: 7410, status: 'En seguimiento', createdAt: '2026-06-01' },
    { id: 'INV-002', projectId: 'PROY-002', investorName: 'Inversiones Andinas SAC', amount: 10000, expectedReturn: 11200, status: 'Registrado', createdAt: '2026-05-29' },
    { id: 'INV-003', projectId: 'PROY-003', investorName: 'Ana Torres', amount: 3000, expectedReturn: 3300, status: 'En seguimiento', createdAt: '2026-06-04' }
  ],
  traceabilityEvents: [
    { id: 'TRZ-001', cattleId: 'GAN-001', investmentId: 'INV-001', eventType: 'Registro productivo', description: 'Peso actualizado y validado por productor.', hashCode: 'AG360-20260601-A81F9C', createdAt: '2026-06-01 10:00' },
    { id: 'TRZ-002', cattleId: 'GAN-002', investmentId: 'INV-002', eventType: 'Financiamiento', description: 'Proyecto alcanzó el 100% de financiamiento.', hashCode: 'AG360-20260602-B92D7E', createdAt: '2026-06-02 12:30' },
    { id: 'TRZ-003', cattleId: 'GAN-003', investmentId: 'INV-003', eventType: 'Sanidad', description: 'Tratamiento veterinario registrado.', hashCode: 'AG360-20260604-F16A20', createdAt: '2026-06-04 17:10' }
  ],
  climateRecords: [
    { id: 'CLI-001', temperature: 22, humidity: 65, rainfall: 4, eventType: 'Normal', location: 'Potrero Norte', createdAt: '2026-06-01 08:00' },
    { id: 'CLI-002', temperature: 27, humidity: 58, rainfall: 0, eventType: 'Calor extremo', location: 'Potrero Sur', createdAt: '2026-06-02 14:00' },
    { id: 'CLI-003', temperature: 18, humidity: 80, rainfall: 12, eventType: 'Lluvia', location: 'Potrero Este', createdAt: '2026-06-03 16:00' }
  ],
  audits: [
    { id: 'AUD-001', user: 'María Soto', action: 'Inicio de sesión', module: 'Seguridad', description: 'Acceso exitoso al panel administrador.', createdAt: '2026-06-08 09:10' },
    { id: 'AUD-002', user: 'Carlos Huamán', action: 'Actualización', module: 'Ganado', description: 'Actualizó datos productivos de AG360-001.', createdAt: '2026-06-07 18:20' },
    { id: 'AUD-003', user: 'Ana Torres', action: 'Consulta', module: 'Crowdfunding', description: 'Revisó rendimiento proyectado de un proyecto.', createdAt: '2026-06-08 11:45' }
  ]
};
