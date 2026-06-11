import React, { FormEvent, useMemo, useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Activity, BarChart3, CloudSun, Coins, Fingerprint, HeartPulse, Plus, Search, ShieldCheck, Sprout, Users, ChevronLeft,
ChevronRight,
Eye,
ImagePlus,
Trash2,
X
} from 'lucide-react';
import { useAgro } from './store';
import type { Access, AuditLog, Cattle, ClimateRecord, HealthRecord, Investment, ProductiveRecord, Project, TraceabilityEvent, UserProfile } from './types';
import { ConfirmButton, EmptyState, exportCsv, KpiCard, Modal, PageHeader, Progress, ReadOnlyNotice, StatusBadge } from './ui';
import { roleNames } from './permissions';
import {
  getUsersFromSupabase,
  saveUserInSupabase,
  deleteUserFromSupabase
} from './usersService';
import {
  getCattleFromSupabase,
  saveCattleInSupabase,
  deleteCattleFromSupabase
} from './cattleService';
import {
  getProductiveFromSupabase,
  saveProductiveInSupabase,
  deleteProductiveFromSupabase
} from './productiveService';
import {
  getHealthFromSupabase,
  saveHealthInSupabase,
  deleteHealthFromSupabase
} from './healthService';
import {
  getProjectsFromSupabase,
  saveProjectInSupabase,
  deleteProjectFromSupabase,
  investProjectInSupabase
} from './projectsService';
import {
  getInvestmentsFromSupabase,
  saveInvestmentInSupabase,
  deleteInvestmentFromSupabase
} from './investmentsService';
import {
  getTraceabilityFromSupabase,
  saveTraceabilityInSupabase,
  deleteTraceabilityFromSupabase,
  generateTraceHash
} from './traceabilityService';
import {
  getClimateFromSupabase,
  saveClimateInSupabase,
  deleteClimateFromSupabase
} from './climateService';
import {
  getAuditsFromSupabase,
  deleteAuditFromSupabase
} from './auditService';

import { getCurrentWeatherByUserLocation } from './weatherService';

const money = (value: number) => `S/ ${Number(value || 0).toLocaleString('es-PE')}`;
const pct = (value: number) => `${Number(value || 0).toFixed(1)}%`;
const canEdit = (access: Access) => access === 'crud';

function lower(value: unknown) {
  return String(value ?? '').toLowerCase();
}

function BlockedButton({ children }: { children: React.ReactNode }) {
  const { setNotice } = useAgro();
  return <button className="secondary-btn" onClick={() => setNotice('Acción bloqueada: este rol solo tiene permiso de consulta.')}>{children}</button>;
}

export function DashboardModule({ title }: { title: string }) {
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [climateRecords, setClimateRecords] = useState<ClimateRecord[]>([]);
  const [traceabilityEvents, setTraceabilityEvents] = useState<TraceabilityEvent[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        cattleData,
        projectsData,
        climateData,
        traceabilityData,
        auditsData
      ] = await Promise.all([
        getCattleFromSupabase(),
        getProjectsFromSupabase(),
        getClimateFromSupabase(),
        getTraceabilityFromSupabase(),
        getAuditsFromSupabase()
      ]);

      setCattle(cattleData);
      setProjects(projectsData);
      setClimateRecords(climateData);
      setTraceabilityEvents(traceabilityData);
      setAudits(auditsData);
    } catch (error) {
      alert('No se pudo cargar el dashboard desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalRaised = projects.reduce(
    (sum, p) => sum + Number(p.raisedAmount || 0),
    0
  );

  const totalGoal = projects.reduce(
    (sum, p) => sum + Number(p.goalAmount || 0),
    0
  );

  const alerts = cattle.filter((c) => c.healthStatus !== 'Sano').length;

  const climate = [...climateRecords]
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
    .slice(-8)
    .map((item) => ({
      ...item,
      shortDate: String(item.createdAt).slice(0, 10),
      temperature: Number(item.temperature || 0),
      humidity: Number(item.humidity || 0)
    }));

  const funding = projects.map((p) => ({
    name: p.title.length > 18 ? `${p.title.slice(0, 18)}...` : p.title,
    recaudado: Number(p.raisedAmount || 0),
    meta: Number(p.goalAmount || 0)
  }));

  const formatAuditDate = (value?: string) => {
    if (!value) return 'Sin fecha';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Vista ejecutiva con indicadores ganaderos, financieros, sanitarios, climáticos y de trazabilidad."
      />

      {loading ? (
        <div className="table-card">
          <strong>Cargando dashboard desde Supabase...</strong>
        </div>
      ) : (
        <>
          <div className="kpi-grid">
            <KpiCard
              title="Ganado registrado"
              value={cattle.length}
              helper="Activos monitoreados"
              icon={<Sprout />}
            />

            <KpiCard
              title="Financiamiento"
              value={money(totalRaised)}
              helper={`Meta total ${money(totalGoal)}`}
              icon={<Coins />}
            />

            <KpiCard
              title="Alertas sanitarias"
              value={alerts}
              helper="Requieren seguimiento"
              icon={<HeartPulse />}
            />

            <KpiCard
              title="Eventos trazables"
              value={traceabilityEvents.length}
              helper="Hashes registrados"
              icon={<Fingerprint />}
            />
          </div>

          <div className="dashboard-grid">
            <div className="panel large-panel dashboard-chart-panel">
              <div className="panel-title">
                <h3>Financiamiento por proyecto</h3>
                <span>Datos de Supabase</span>
              </div>

              {funding.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funding}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e2" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => money(value)} />
                    <Legend />
                    <Bar
                      dataKey="meta"
                      name="Meta S/"
                      fill="#1f7a4d"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="recaudado"
                      name="Recaudado S/"
                      fill="#7ac77f"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin proyectos"
                  description="Crea proyectos de crowdfunding para visualizar el financiamiento."
                />
              )}
            </div>

            <div className="panel dashboard-chart-panel">
              <div className="panel-title">
                <h3>Clima reciente</h3>
                <span>Registros reales / IoT</span>
              </div>

              {climate.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={climate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e2" />
                    <XAxis dataKey="shortDate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      name="Temperatura °C"
                      stroke="#d99a21"
                      strokeWidth={4}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      name="Humedad %"
                      stroke="#2d8ac7"
                      strokeWidth={4}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin clima"
                  description="Registra clima real o simula un sensor IoT para ver tendencias."
                />
              )}
            </div>
          </div>

          <div className="panel dashboard-activity-panel">
            <div className="panel-title">
              <h3>Actividad reciente</h3>
              <span>Auditoría desde Supabase</span>
            </div>

            <div className="timeline">
              {audits.slice(0, 5).map((item) => (
                <div key={item.id} className="timeline-item">
                  <span />
                  <div>
                    <strong>
                      {item.action} · {item.module}
                    </strong>
                    <p>{item.description}</p>
                    <small>
                      {item.user} · {formatAuditDate(item.createdAt)}
                    </small>
                  </div>
                </div>
              ))}

              {!audits.length && (
                <EmptyState
                  title="Sin actividad"
                  description="Aún no existen eventos de auditoría registrados."
                />
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export function UsersModule({ access }: { access: Access }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('todos');
  const [editing, setEditing] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersFromSupabase();
      setUsers(data);
    } catch (error) {
      alert('No se pudieron cargar los usuarios desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const rows = users.filter((u) => {
    const matchesQuery =
      lower(u.fullName).includes(lower(query)) ||
      lower(u.email).includes(lower(query));

    const matchesRole = role === 'todos' || u.role === role;

    return matchesQuery && matchesRole;
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);

      const savedUser = await saveUserInSupabase(editing || {});

      setUsers((current) => {
        const exists = current.some((u) => u.id === savedUser.id);

        if (exists) {
          return current.map((u) => (u.id === savedUser.id ? savedUser : u));
        }

        return [...current, savedUser];
      });

      setEditing(null);
    } catch (error) {
      alert('No se pudo guardar el usuario. Revisa la consola o las políticas de Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (id: string) => {
    try {
      await deleteUserFromSupabase(id);
      setUsers((current) => current.filter((u) => u.id !== id));
    } catch (error) {
      alert('No se pudo eliminar el usuario desde Supabase.');
    }
  };

  return (
    <section>
      <PageHeader
        title="Gestión de Usuarios y Seguridad"
        description="Administra perfiles, roles, estados de acceso y control de permisos básicos."
        action={
          canEdit(access) ? (
            <button
              className="primary-btn"
              onClick={() =>
                setEditing({
                  role: 'productor',
                  status: 'Activo',
                  lastAccess: new Date().toLocaleString('es-PE')
                })
              }
            >
              <Plus size={17} /> Nuevo usuario
            </button>
          ) : (
            <BlockedButton>Nuevo usuario</BlockedButton>
          )
        }
      />

      {!canEdit(access) && <ReadOnlyNotice />}

      <div className="filters">
        <label>
          <Search size={16} />
          <input
            placeholder="Buscar usuario o email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="todos">Todos los roles</option>
          {Object.entries(roleNames).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <strong>Cargando usuarios desde Supabase...</strong>
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.fullName}</strong>
                    <small>{u.email}</small>
                  </td>
                  <td>{roleNames[u.role]}</td>
                  <td>{u.phone}</td>
                  <td><StatusBadge value={u.status} /></td>
                  <td>{u.lastAccess}</td>
                  <td className="actions">
                    <button
                      className="secondary-btn"
                      disabled={!canEdit(access)}
                      onClick={() => setEditing(u)}
                    >
                      Editar
                    </button>

                    <ConfirmButton
                      label="Eliminar"
                      disabled={!canEdit(access)}
                      message="¿Eliminar usuario?"
                      onConfirm={() => removeUser(u.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && !rows.length && (
          <EmptyState
            title="Sin usuarios"
            description="No se encontraron usuarios con esos filtros."
          />
        )}
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Editar usuario' : 'Nuevo usuario'}
          onClose={() => setEditing(null)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label>
              Nombre completo
              <input
                required
                value={editing.fullName || ''}
                onChange={(e) =>
                  setEditing({ ...editing, fullName: e.target.value })
                }
              />
            </label>

            <label>
              Email
              <input
                required
                type="email"
                value={editing.email || ''}
                onChange={(e) =>
                  setEditing({ ...editing, email: e.target.value })
                }
              />
            </label>

            <label>
              Rol
              <select
                value={editing.role || 'productor'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    role: e.target.value as UserProfile['role']
                  })
                }
              >
                {Object.entries(roleNames).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Teléfono
              <input
                value={editing.phone || ''}
                onChange={(e) =>
                  setEditing({ ...editing, phone: e.target.value })
                }
              />
            </label>

            <label>
              Estado
              <select
                value={editing.status || 'Activo'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value as UserProfile['status']
                  })
                }
              >
                <option>Activo</option>
                <option>Suspendido</option>
                <option>Pendiente</option>
              </select>
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

const MAX_CATTLE_IMAGES = 4;

type ImageViewer = {
  images: string[];
  index: number;
  title: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer la imagen.'));
    };

    reader.readAsDataURL(file);
  });
}

function isValidImageFile(file: File) {
  const validByType = file.type.startsWith('image/');
  const validByName = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

  return validByType || validByName;
}

function CattleImageViewer({
  viewer,
  onClose,
  onPrev,
  onNext
}: {
  viewer: ImageViewer;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const images = viewer.images || [];
  const safeIndex = Math.min(Math.max(viewer.index, 0), Math.max(images.length - 1, 0));
  const currentImage = images[safeIndex];
  const hasMultiple = images.length > 1;

  if (!currentImage) {
    return (
      <div className="image-lightbox" onClick={onClose}>
        <div className="image-lightbox-card" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="lightbox-close" onClick={onClose}>
            <X size={20} />
          </button>

          <div className="lightbox-title">
            <strong>{viewer.title || 'Imagen del ganado'}</strong>
            <span>Sin imagen disponible</span>
          </div>

          <div className="lightbox-empty">
            No se pudo cargar la imagen seleccionada.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="image-lightbox" onClick={onClose}>
      <div className="image-lightbox-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lightbox-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="lightbox-title">
          <strong>{viewer.title || 'Imagen del ganado'}</strong>
          <span>
            Foto {safeIndex + 1} de {images.length}
          </span>
        </div>

        <div className="lightbox-image-wrap">
          {hasMultiple && (
            <button type="button" className="lightbox-nav left" onClick={onPrev}>
              <ChevronLeft size={24} />
            </button>
          )}

          <img src={currentImage} alt={viewer.title || 'Imagen del ganado'} />

          {hasMultiple && (
            <button type="button" className="lightbox-nav right" onClick={onNext}>
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CattleModule({
  access,
  title = 'Gestión y Trazabilidad del Ganado'
}: {
  access: Access;
  title?: string;
}) {
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('todos');
  const [editing, setEditing] = useState<Partial<Cattle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageIndex, setImageIndex] = useState<Record<string, number>>({});
  const [viewer, setViewer] = useState<ImageViewer | null>(null);

  const loadCattle = async () => {
    try {
      setLoading(true);
      const data = await getCattleFromSupabase();
      setCattle(data);
    } catch (error) {
      alert('No se pudo cargar el ganado desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCattle();
  }, []);

  const rows = cattle.filter((c) => {
    const q = lower(query);

    return (
      (
        lower(c.name).includes(q) ||
        lower(c.code).includes(q) ||
        lower(c.breed).includes(q)
      ) &&
      (status === 'todos' || c.healthStatus === status)
    );
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    setSaving(true);

    const saved = await saveCattleInSupabase({
      ...(editing || {}),
      images: editing?.images || []
    });

    setCattle((current) => {
      const exists = current.some((item) => item.id === saved.id);

      if (exists) {
        return current.map((item) => item.id === saved.id ? saved : item);
      }

      return [saved, ...current];
    });

    setEditing(null);
  } catch (error) {
    alert('No se pudo guardar el registro de ganado. Revisa Supabase.');
  } finally {
    setSaving(false);
  }
};

  const changeCardImage = (cattleId: string, nextIndex: number, total: number) => {
    setImageIndex((current) => ({
      ...current,
      [cattleId]: (nextIndex + total) % total
    }));
  };


  const addImages = async (files: FileList | null) => {
  if (!editing) return;

  if (!files || files.length === 0) {
    alert('No seleccionaste ninguna imagen.');
    return;
  }

  const currentImages = editing.images || [];

  if (currentImages.length >= MAX_CATTLE_IMAGES) {
    alert('Solo puedes subir hasta 4 imágenes por animal.');
    return;
  }

  const availableSlots = MAX_CATTLE_IMAGES - currentImages.length;

  const selectedFiles = Array.from(files)
    .filter(isValidImageFile)
    .slice(0, availableSlots);

  if (!selectedFiles.length) {
    alert('Selecciona imágenes válidas en formato JPG, PNG, WEBP o GIF.');
    return;
  }

  try {
    const newImages = await Promise.all(
      selectedFiles.map((file) => readFileAsDataUrl(file))
    );

    setEditing((current) => {
      if (!current) return current;

      return {
        ...current,
        images: [...(current.images || []), ...newImages].slice(0, MAX_CATTLE_IMAGES)
      };
    });
  } catch (error) {
    alert('No se pudieron cargar las imágenes seleccionadas.');
  }
};

  const removeEditingImage = (indexToRemove: number) => {
    if (!editing) return;

    setEditing({
      ...editing,
      images: (editing.images || []).filter((_, index) => index !== indexToRemove)
    });
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Registra animales, consulta su información individual, ubicación, estado y datos productivos básicos."
        action={
          canEdit(access) ? (
            <button
              className="primary-btn"
              onClick={() =>
                setEditing({
                  healthStatus: 'Sano',
                  sex: 'Hembra',
                  funded: false,
                  images: []
                })
              }
            >
              <Plus size={17} /> Nuevo ganado
            </button>
          ) : (
            <BlockedButton>Nuevo ganado</BlockedButton>
          )
        }
      />

      {!canEdit(access) && <ReadOnlyNotice />}

      <div className="filters">
        <label>
          <Search size={16} />
          <input
            placeholder="Buscar por código, nombre o raza"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option>Sano</option>
          <option>En observación</option>
          <option>Alerta sanitaria</option>
          <option>Tratamiento</option>
        </select>
      </div>

      <div className="card-grid cattle-grid">
        {rows.map((c) => {
          const images = c.images || [];
          const currentIndex = Math.min(
            imageIndex[c.id] || 0,
            Math.max(images.length - 1, 0)
          );
          const currentImage = images[currentIndex];

          return (
            <article key={c.id} className="animal-card marketplace-animal-card">
              <div className={`animal-gallery ${currentImage ? 'has-image' : 'empty-gallery'}`}>
                {currentImage ? (
                  <button
                    type="button"
                    className="gallery-image-button"
                    onClick={() => {
                      if (!images.length) return;

                      setViewer({
                        images,
                        index: currentIndex,
                        title: c.name || 'Imagen del ganado'
                      });
                    }}
                  >
                    <img src={currentImage} alt={c.name} />
                    <span className="gallery-open-badge">
                      <Eye size={15} /> Ver
                    </span>
                  </button>
                ) : (
                  <div className="gallery-placeholder">
                    <span>🐄</span>
                    <strong>Sin imágenes</strong>
                    <small>Agrega fotos del animal</small>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gallery-nav prev"
                      onClick={() =>
                        changeCardImage(c.id, currentIndex - 1, images.length)
                      }
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      className="gallery-nav next"
                      onClick={() =>
                        changeCardImage(c.id, currentIndex + 1, images.length)
                      }
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {images.length > 0 && (
                  <span className="gallery-counter">
                    {currentIndex + 1}/{images.length}
                  </span>
                )}
              </div>

              <div className="animal-card-head">
                <span className="animal-avatar">🐄</span>
                <StatusBadge value={c.healthStatus} />
              </div>

              <h3>{c.name}</h3>

              <p className="animal-meta">
                {c.code} · {c.breed} · {c.sex}
              </p>

              <div className="animal-stats">
                <span>
                  <b>{c.weight} kg</b>
                  Peso
                </span>

                <span>
                  <b>{c.temperature} °C</b>
                  Temp.
                </span>

                <span>
                  <b>{c.location}</b>
                  Ubicación
                </span>
              </div>

              <div className="gps-card">GPS: {c.gps}</div>

              <div className={`funded-chip ${c.funded ? '' : 'is-hidden'}`}>
                Asociado a financiamiento
              </div>

              <div className="actions">
                <button
                  className="secondary-btn"
                  disabled={!canEdit(access)}
                  onClick={() => setEditing({ ...c, images: c.images || [] })}
                >
                  Editar
                </button>

                <ConfirmButton
                  label="Eliminar"
                  disabled={!canEdit(access)}
                  message="¿Eliminar animal?"
                  onConfirm={async () => {
                    try {
                      await deleteCattleFromSupabase(c.id);
                      setCattle((current) => current.filter((item) => item.id !== c.id));
                    } catch (error) {
                      alert('No se pudo eliminar el animal desde Supabase.');
                    }
                  }}
                />
              </div>
            </article>
          );
        })}

        {!rows.length && (
          <EmptyState
            title="Sin ganado"
            description="No se encontraron animales con esos filtros."
          />
        )}
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Editar ganado' : 'Nuevo registro de ganado'}
          onClose={() => setEditing(null)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label>
              Código
              <input
                value={editing.code || ''}
                onChange={(e) =>
                  setEditing({ ...editing, code: e.target.value })
                }
              />
            </label>

            <label>
              Nombre
              <input
                required
                value={editing.name || ''}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </label>

            <label>
              Raza
              <input
                value={editing.breed || ''}
                onChange={(e) =>
                  setEditing({ ...editing, breed: e.target.value })
                }
              />
            </label>

            <label>
              Sexo
              <select
                value={editing.sex || 'Hembra'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    sex: e.target.value as Cattle['sex']
                  })
                }
              >
                <option>Hembra</option>
                <option>Macho</option>
              </select>
            </label>

            <label>
              Peso kg
              <input
                type="number"
                value={editing.weight || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    weight: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Temperatura
              <input
                type="number"
                step="0.1"
                value={editing.temperature || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    temperature: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Estado
              <select
                value={editing.healthStatus || 'Sano'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    healthStatus: e.target.value as Cattle['healthStatus']
                  })
                }
              >
                <option>Sano</option>
                <option>En observación</option>
                <option>Alerta sanitaria</option>
                <option>Tratamiento</option>
              </select>
            </label>

            <label>
              Ubicación
              <input
                value={editing.location || ''}
                onChange={(e) =>
                  setEditing({ ...editing, location: e.target.value })
                }
              />
            </label>

            <label>
              GPS
              <input
                value={editing.gps || ''}
                onChange={(e) =>
                  setEditing({ ...editing, gps: e.target.value })
                }
              />
            </label>

            <div className="image-uploader cattle-form-wide">
              <div className="image-uploader-title">
                <strong>Imágenes del animal</strong>
                <small>Máximo 4 fotos. Se mostrarán como carrusel en la tarjeta.</small>
              </div>

              <label className="upload-box">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  multiple
                  onChange={async (e) => {
                    await addImages(e.currentTarget.files);
                    e.currentTarget.value = '';
                  }}
                />

                <ImagePlus size={22} />
                <span>Subir imágenes</span>
                <small>{editing.images?.length || 0}/4 imágenes cargadas</small>
              </label>

              {!!editing.images?.length && (
                <div className="image-preview-grid">
                  {editing.images.map((image, index) => (
                    <div key={`${image.slice(0, 30)}-${index}`} className="form-image-thumb">
                      <img src={image} alt={`Imagen ${index + 1}`} />

                      <button
                        type="button"
                        onClick={() =>
                          setEditing((current) => {
                            if (!current) return current;

                            return {
                              ...current,
                              images: (current.images || []).filter((_, i) => i !== index)
                            };
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="checkbox cattle-form-wide">
              <input
                type="checkbox"
                checked={Boolean(editing.funded)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    funded: e.target.checked
                  })
                }
              />
              Asociado a financiamiento
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewer && (
        <CattleImageViewer
          viewer={viewer}
          onClose={() => setViewer(null)}
          onPrev={() =>
            setViewer((current) => {
              if (!current || !current.images.length) return current;

              return {
                ...current,
                index:
                  (current.index - 1 + current.images.length) %
                  current.images.length
              };
            })
          }
          onNext={() =>
            setViewer((current) => {
              if (!current || !current.images.length) return current;

              return {
                ...current,
                index: (current.index + 1) % current.images.length
              };
            })
          }
        />
      )}
    </section>
  );
}

export function ProductiveModule({
  access,
  title = 'Historial Productivo'
}: {
  access: Access;
  title?: string;
}) {
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [records, setRecords] = useState<ProductiveRecord[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Partial<ProductiveRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [cattleData, productiveData] = await Promise.all([
        getCattleFromSupabase(),
        getProductiveFromSupabase()
      ]);

      setCattle(cattleData);
      setRecords(productiveData);
    } catch (error) {
      alert('No se pudo cargar el historial productivo desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAnimal = (cattleId?: string) => {
    return cattle.find((c) => c.id === cattleId);
  };

  const rows = records.filter((r) => {
    const animal = getAnimal(r.cattleId);
    const text = `${animal?.name || ''} ${animal?.code || ''} ${r.cattleId || ''} ${r.note || ''}`;

    return lower(text).includes(lower(query));
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editing?.cattleId) {
      alert('Selecciona un animal para guardar el registro.');
      return;
    }

    try {
      setSaving(true);

      const saved = await saveProductiveInSupabase(editing || {});

      setRecords((current) => {
        const exists = current.some((item) => item.id === saved.id);

        if (exists) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }

        return [saved, ...current];
      });

      setEditing(null);
    } catch (error) {
      alert('No se pudo guardar el registro productivo. Revisa Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (id: string) => {
    try {
      await deleteProductiveFromSupabase(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert('No se pudo eliminar el registro productivo desde Supabase.');
    }
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Registra peso, producción de leche, notas productivas y evolución por animal."
        action={
          canEdit(access) ? (
            <button
              className="primary-btn"
              onClick={() =>
                setEditing({
                  cattleId: cattle[0]?.id || '',
                  recordDate: new Date().toISOString().slice(0, 10),
                  weight: cattle[0]?.weight || 0,
                  milkProduction: 0,
                  note: ''
                })
              }
              disabled={!cattle.length}
            >
              <Plus size={17} /> Nuevo registro
            </button>
          ) : (
            <BlockedButton>Nuevo registro</BlockedButton>
          )
        }
      />

      {!canEdit(access) && <ReadOnlyNotice />}

      {!cattle.length && !loading && (
        <div className="readonly-notice">
          Primero registra ganado para poder crear historial productivo.
        </div>
      )}

      <div className="filters">
        <label>
          <Search size={16} />
          <input
            placeholder="Buscar animal, código o nota"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Animal</th>
              <th>Fecha</th>
              <th>Peso</th>
              <th>Producción leche</th>
              <th>Nota</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <strong>Cargando historial productivo desde Supabase...</strong>
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const animal = getAnimal(r.cattleId);

                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{animal?.name || 'Animal no encontrado'}</strong>
                      <small>{animal?.code || r.cattleId}</small>
                    </td>

                    <td>{r.recordDate}</td>
                    <td>{r.weight} kg</td>
                    <td>{r.milkProduction} L</td>
                    <td>{r.note}</td>

                    <td className="actions">
                      <button
                        className="secondary-btn"
                        disabled={!canEdit(access)}
                        onClick={() => setEditing(r)}
                      >
                        Editar
                      </button>

                      <ConfirmButton
                        label="Eliminar"
                        disabled={!canEdit(access)}
                        message="¿Eliminar registro productivo?"
                        onConfirm={() => removeRecord(r.id)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && !rows.length && (
          <EmptyState
            title="Sin registros"
            description="Agrega un registro productivo o cambia los filtros."
          />
        )}
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Editar registro productivo' : 'Nuevo registro productivo'}
          onClose={() => setEditing(null)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label>
              Animal
              <select
                required
                value={editing.cattleId || cattle[0]?.id || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    cattleId: e.target.value
                  })
                }
              >
                {!cattle.length && (
                  <option value="">No hay ganado registrado</option>
                )}

                {cattle.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha
              <input
                type="date"
                value={editing.recordDate || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    recordDate: e.target.value
                  })
                }
              />
            </label>

            <label>
              Peso
              <input
                type="number"
                value={editing.weight ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    weight: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Producción leche
              <input
                type="number"
                value={editing.milkProduction ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    milkProduction: Number(e.target.value)
                  })
                }
              />
            </label>

            <label className="full">
              Nota
              <textarea
                value={editing.note || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    note: e.target.value
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}




export function HealthModule({
  access,
  title = 'Monitoreo Productivo y Sanitario'
}: {
  access: Access;
  title?: string;
}) {
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('todos');
  const [editing, setEditing] = useState<Partial<HealthRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [cattleData, healthData] = await Promise.all([
        getCattleFromSupabase(),
        getHealthFromSupabase()
      ]);

      setCattle(cattleData);
      setRecords(healthData);
    } catch (error) {
      alert('No se pudo cargar el módulo sanitario desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAnimal = (cattleId?: string) => {
    return cattle.find((c) => c.id === cattleId);
  };

  const rows = records.filter((r) => {
    const animal = getAnimal(r.cattleId);

    const text = `${animal?.name || ''} ${animal?.code || ''} ${r.cattleId || ''} ${r.diagnosis || ''} ${r.treatment || ''} ${r.vaccine || ''}`;

    const matchesQuery = lower(text).includes(lower(query));
    const matchesStatus = status === 'todos' || r.status === status;

    return matchesQuery && matchesStatus;
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editing?.cattleId) {
      alert('Selecciona un animal para guardar el control sanitario.');
      return;
    }

    try {
      setSaving(true);

      const saved = await saveHealthInSupabase(editing || {});

      setRecords((current) => {
        const exists = current.some((item) => item.id === saved.id);

        if (exists) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }

        return [saved, ...current];
      });

      setEditing(null);
    } catch (error) {
      alert('No se pudo guardar el control sanitario. Revisa Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (id: string) => {
    try {
      await deleteHealthFromSupabase(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert('No se pudo eliminar el registro sanitario desde Supabase.');
    }
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Control sanitario, diagnósticos, vacunas, tratamientos, alertas y próximas revisiones."
        action={
          canEdit(access) ? (
            <button
              className="primary-btn"
              onClick={() =>
                setEditing({
                  cattleId: cattle[0]?.id || '',
                  status: 'Pendiente',
                  diagnosis: '',
                  treatment: '',
                  vaccine: '',
                  nextCheckup: new Date().toISOString().slice(0, 10)
                })
              }
              disabled={!cattle.length}
            >
              <Plus size={17} /> Nuevo control
            </button>
          ) : (
            <BlockedButton>Nuevo control</BlockedButton>
          )
        }
      />

      {!canEdit(access) && <ReadOnlyNotice />}

      {!cattle.length && !loading && (
        <div className="readonly-notice">
          Primero registra ganado para poder crear controles sanitarios.
        </div>
      )}

      <div className="filters">
        <label>
          <Search size={16} />
          <input
            placeholder="Buscar diagnóstico, tratamiento o animal"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos</option>
          <option>Controlado</option>
          <option>Pendiente</option>
          <option>Urgente</option>
        </select>
      </div>

      {loading ? (
        <div className="table-card">
          <strong>Cargando controles sanitarios desde Supabase...</strong>
        </div>
      ) : (
        <div className="card-grid">
          {rows.map((r) => {
            const animal = getAnimal(r.cattleId);

            return (
              <article key={r.id} className="info-card">
                <div className="info-head">
                  <HeartPulse />
                  <StatusBadge value={r.status} />
                </div>

                <h3>{animal?.name || 'Animal no encontrado'}</h3>

                <p>
                  <b>Diagnóstico:</b> {r.diagnosis}
                </p>

                <p>
                  <b>Tratamiento:</b> {r.treatment}
                </p>

                <p>
                  <b>Vacuna:</b> {r.vaccine}
                </p>

                <small>
                  Próxima revisión: {r.nextCheckup || 'Sin fecha'}
                </small>

                <div className="actions">
                  <button
                    className="secondary-btn"
                    disabled={!canEdit(access)}
                    onClick={() => setEditing(r)}
                  >
                    Editar
                  </button>

                  <ConfirmButton
                    label="Eliminar"
                    disabled={!canEdit(access)}
                    message="¿Eliminar registro sanitario?"
                    onConfirm={() => removeRecord(r.id)}
                  />
                </div>
              </article>
            );
          })}

          {!rows.length && (
            <EmptyState
              title="Sin controles"
              description="No se encontraron registros sanitarios."
            />
          )}
        </div>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Editar control sanitario' : 'Nuevo control sanitario'}
          onClose={() => setEditing(null)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label>
              Animal
              <select
                required
                value={editing.cattleId || cattle[0]?.id || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    cattleId: e.target.value
                  })
                }
              >
                {!cattle.length && (
                  <option value="">No hay ganado registrado</option>
                )}

                {cattle.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Estado
              <select
                value={editing.status || 'Pendiente'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value as HealthRecord['status']
                  })
                }
              >
                <option>Controlado</option>
                <option>Pendiente</option>
                <option>Urgente</option>
              </select>
            </label>

            <label>
              Diagnóstico
              <input
                required
                value={editing.diagnosis || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    diagnosis: e.target.value
                  })
                }
              />
            </label>

            <label>
              Tratamiento
              <input
                value={editing.treatment || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    treatment: e.target.value
                  })
                }
              />
            </label>

            <label>
              Vacuna
              <input
                value={editing.vaccine || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    vaccine: e.target.value
                  })
                }
              />
            </label>

            <label>
              Próxima revisión
              <input
                type="date"
                value={editing.nextCheckup || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    nextCheckup: e.target.value
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}



export function ProjectsModule({
  access,
  investorMode = false,
  title = 'Crowdfunding Ganadero'
}: {
  access: Access;
  investorMode?: boolean;
  title?: string;
}) {
  const { currentUser } = useAgro();

  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('todos');
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [investmentProject, setInvestmentProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [investing, setInvesting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [cattleData, projectsData] = await Promise.all([
        getCattleFromSupabase(),
        getProjectsFromSupabase()
      ]);

      setCattle(cattleData);
      setProjects(projectsData);
    } catch (error) {
      alert('No se pudo cargar el módulo de crowdfunding desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAnimal = (cattleId?: string) => {
    return cattle.find((c) => c.id === cattleId);
  };

  const rows = projects.filter((p) => {
    const animal = getAnimal(p.cattleId);

    const text = `${p.title || ''} ${p.description || ''} ${animal?.code || ''} ${animal?.name || ''}`;

    const matchesQuery = lower(text).includes(lower(query));
    const matchesStatus = status === 'todos' || p.status === status;

    return matchesQuery && matchesStatus;
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editing?.cattleId) {
      alert('Selecciona un ganado asociado para crear el proyecto.');
      return;
    }

    try {
      setSaving(true);

      const saved = await saveProjectInSupabase(editing || {});

      setProjects((current) => {
        const exists = current.some((item) => item.id === saved.id);

        if (exists) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }

        return [saved, ...current];
      });

      setEditing(null);
    } catch (error) {
      alert('No se pudo guardar el proyecto. Revisa Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (id: string) => {
    try {
      await deleteProjectFromSupabase(id);
      setProjects((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert('No se pudo eliminar el proyecto desde Supabase.');
    }
  };

  const confirmInvestment = async () => {
    if (!investmentProject) return;

    if (amount <= 0) {
      alert('Ingresa un monto válido para invertir.');
      return;
    }

    try {
      setInvesting(true);

      const updatedProject = await investProjectInSupabase(
        investmentProject,
        amount,
        currentUser || 'Inversionista demo'
      );

      setProjects((current) =>
        current.map((item) =>
          item.id === updatedProject.id ? updatedProject : item
        )
      );

      setInvestmentProject(null);
      setAmount(1000);
    } catch (error) {
      alert('No se pudo registrar la inversión en Supabase.');
    } finally {
      setInvesting(false);
    }
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Publica oportunidades ganaderas, registra aportes, consulta rentabilidad proyectada y estado de financiamiento."
        action={
          canEdit(access) && !investorMode ? (
            <button
              className="primary-btn"
              onClick={() =>
                setEditing({
                  cattleId: cattle[0]?.id || '',
                  status: 'Activo',
                  goalAmount: 0,
                  raisedAmount: 0,
                  projectedReturn: 10,
                  endDate: new Date().toISOString().slice(0, 10)
                })
              }
              disabled={!cattle.length}
            >
              <Plus size={17} /> Nuevo proyecto
            </button>
          ) : investorMode ? null : (
            <BlockedButton>Nuevo proyecto</BlockedButton>
          )
        }
      />

      {!canEdit(access) && !investorMode && <ReadOnlyNotice />}

      {!cattle.length && !loading && !investorMode && (
        <div className="readonly-notice">
          Primero registra ganado para poder crear proyectos de crowdfunding.
        </div>
      )}

      <div className="filters">
        <label>
          <Search size={16} />
          <input
            placeholder="Buscar proyecto, ganado o descripción"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos</option>
          <option>Activo</option>
          <option>Financiado</option>
          <option>Cerrado</option>
        </select>
      </div>

      {loading ? (
        <div className="table-card">
          <strong>Cargando proyectos desde Supabase...</strong>
        </div>
      ) : (
        <div className="card-grid projects-grid">
          {rows.map((p) => {
            const animal = getAnimal(p.cattleId);

            return (
              <article key={p.id} className="project-card">
                <div className="project-top">
                  <Coins />
                  <StatusBadge value={p.status} />
                </div>

                <h3>{p.title}</h3>

                <p>{p.description}</p>

                <small>
                  Ganado asociado: {animal?.code || p.cattleId}
                </small>

                <Progress value={p.raisedAmount} max={p.goalAmount} />

                <div className="project-meta">
                  <span>
                    Rentabilidad
                    <br />
                    <b>{pct(p.projectedReturn)}</b>
                  </span>

                  <span>
                    Cierre
                    <br />
                    <b>{p.endDate || 'Sin fecha'}</b>
                  </span>
                </div>

                <div className="actions">
                  {investorMode ? (
                    <button
                      className="primary-btn"
                      disabled={p.status !== 'Activo'}
                      onClick={() => {
                        setInvestmentProject(p);
                        setAmount(1000);
                      }}
                    >
                      Invertir ahora
                    </button>
                  ) : (
                    <>
                      <button
                        className="secondary-btn"
                        disabled={!canEdit(access)}
                        onClick={() => setEditing(p)}
                      >
                        Editar
                      </button>

                      <ConfirmButton
                        label="Eliminar"
                        disabled={!canEdit(access)}
                        message="¿Eliminar proyecto?"
                        onConfirm={() => removeProject(p.id)}
                      />
                    </>
                  )}
                </div>
              </article>
            );
          })}

          {!rows.length && (
            <EmptyState
              title="Sin proyectos"
              description="No existen proyectos para esos filtros."
            />
          )}
        </div>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Editar proyecto' : 'Nuevo proyecto'}
          onClose={() => setEditing(null)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label className="full">
              Título
              <input
                required
                value={editing.title || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    title: e.target.value
                  })
                }
              />
            </label>

            <label className="full">
              Descripción
              <textarea
                value={editing.description || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    description: e.target.value
                  })
                }
              />
            </label>

            <label>
              Ganado
              <select
                required
                value={editing.cattleId || cattle[0]?.id || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    cattleId: e.target.value
                  })
                }
              >
                {!cattle.length && (
                  <option value="">No hay ganado registrado</option>
                )}

                {cattle.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Meta S/
              <input
                type="number"
                value={editing.goalAmount ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    goalAmount: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Recaudado S/
              <input
                type="number"
                value={editing.raisedAmount ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    raisedAmount: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Rentabilidad %
              <input
                type="number"
                value={editing.projectedReturn ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    projectedReturn: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Estado
              <select
                value={editing.status || 'Activo'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value as Project['status']
                  })
                }
              >
                <option>Activo</option>
                <option>Financiado</option>
                <option>Cerrado</option>
              </select>
            </label>

            <label>
              Fecha cierre
              <input
                type="date"
                value={editing.endDate || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    endDate: e.target.value
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {investmentProject && (
        <Modal
          title="Simular inversión ganadera"
          onClose={() => setInvestmentProject(null)}
        >
          <div className="invest-box">
            <h3>{investmentProject.title}</h3>

            <p>
              Rentabilidad proyectada:{' '}
              <b>{pct(investmentProject.projectedReturn)}</b>
            </p>

            <Progress
              value={investmentProject.raisedAmount}
              max={investmentProject.goalAmount}
            />

            <label>
              Monto a invertir S/
              <input
                type="number"
                min={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>

            <div className="simulated-result">
              Retorno estimado:{' '}
              <b>
                {money(
                  amount + amount * (investmentProject.projectedReturn / 100)
                )}
              </b>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setInvestmentProject(null)}
              >
                Cancelar
              </button>

              <button
                className="primary-btn"
                onClick={confirmInvestment}
                disabled={investing}
              >
                {investing ? 'Registrando...' : 'Confirmar inversión'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}



export function InvestmentsModule({
  access,
  title = 'Seguimiento de Inversiones'
}: {
  access: Access;
  title?: string;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Partial<Investment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [projectsData, investmentsData] = await Promise.all([
        getProjectsFromSupabase(),
        getInvestmentsFromSupabase()
      ]);

      setProjects(projectsData);
      setInvestments(investmentsData);
    } catch (error) {
      alert('No se pudo cargar el módulo de inversiones desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProject = (projectId?: string) => {
    return projects.find((p) => p.id === projectId);
  };

  const rows = investments.filter((i) => {
    const project = getProject(i.projectId);

    const text = `${i.investorName || ''} ${project?.title || ''} ${project?.description || ''} ${i.projectId || ''}`;

    return lower(text).includes(lower(query));
  });

  const calculateExpectedReturn = (
    projectId?: string,
    amountValue?: number
  ) => {
    const project = getProject(projectId);
    const amountNumber = Number(amountValue || 0);
    const returnPercent = Number(project?.projectedReturn || 0);

    return amountNumber + amountNumber * (returnPercent / 100);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editing?.projectId) {
      alert('Selecciona un proyecto para guardar la inversión.');
      return;
    }

    if (!editing?.investorName) {
      alert('Ingresa el nombre del inversionista.');
      return;
    }

    try {
      setSaving(true);

      const payload: Partial<Investment> = {
        ...editing,
        amount: Number(editing.amount || 0),
        expectedReturn:
          Number(editing.expectedReturn || 0) ||
          calculateExpectedReturn(editing.projectId, editing.amount)
      };

      const saved = await saveInvestmentInSupabase(payload);

      setInvestments((current) => {
        const exists = current.some((item) => item.id === saved.id);

        if (exists) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }

        return [saved, ...current];
      });

      setEditing(null);
    } catch (error) {
      alert('No se pudo guardar la inversión. Revisa Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const removeInvestment = async (id: string) => {
    try {
      await deleteInvestmentFromSupabase(id);
      setInvestments((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert('No se pudo eliminar la inversión desde Supabase.');
    }
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Consulta aportes, retorno esperado, estado de inversiones y asociación con proyectos ganaderos."
        action={
          canEdit(access) ? (
            <button
              className="primary-btn"
              onClick={() => {
                const firstProject = projects[0];

                setEditing({
                  projectId: firstProject?.id || '',
                  investorName: '',
                  amount: 0,
                  expectedReturn: 0,
                  status: 'Registrado',
                  createdAt: new Date().toISOString().slice(0, 10)
                });
              }}
              disabled={!projects.length}
            >
              <Plus size={17} /> Nueva inversión
            </button>
          ) : null
        }
      />

      {!canEdit(access) && <ReadOnlyNotice />}

      {!projects.length && !loading && (
        <div className="readonly-notice">
          Primero registra proyectos de crowdfunding para poder crear inversiones.
        </div>
      )}

      <div className="filters">
        <label>
          <Search size={16} />
          <input
            placeholder="Buscar inversionista o proyecto"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Inversionista</th>
              <th>Monto</th>
              <th>Retorno esperado</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <strong>Cargando inversiones desde Supabase...</strong>
                </td>
              </tr>
            ) : (
              rows.map((i) => {
                const project = getProject(i.projectId);

                return (
                  <tr key={i.id}>
                    <td>
                      <strong>{project?.title || 'Proyecto no encontrado'}</strong>
                      <small>{project?.id || i.projectId}</small>
                    </td>

                    <td>{i.investorName}</td>
                    <td>{money(i.amount)}</td>
                    <td>{money(i.expectedReturn)}</td>
                    <td>
                      <StatusBadge value={i.status} />
                    </td>
                    <td>{i.createdAt}</td>

                    <td className="actions">
                      <button
                        className="secondary-btn"
                        disabled={!canEdit(access)}
                        onClick={() => setEditing(i)}
                      >
                        Editar
                      </button>

                      <ConfirmButton
                        label="Eliminar"
                        disabled={!canEdit(access)}
                        message="¿Eliminar inversión?"
                        onConfirm={() => removeInvestment(i.id)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && !rows.length && (
          <EmptyState
            title="Sin inversiones"
            description="No se encontraron inversiones."
          />
        )}
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Editar inversión' : 'Nueva inversión'}
          onClose={() => setEditing(null)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label>
              Proyecto
              <select
                required
                value={editing.projectId || projects[0]?.id || ''}
                onChange={(e) => {
                  const projectId = e.target.value;
                  const expectedReturn = calculateExpectedReturn(
                    projectId,
                    editing.amount
                  );

                  setEditing({
                    ...editing,
                    projectId,
                    expectedReturn
                  });
                }}
              >
                {!projects.length && (
                  <option value="">No hay proyectos registrados</option>
                )}

                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Inversionista
              <input
                required
                value={editing.investorName || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    investorName: e.target.value
                  })
                }
              />
            </label>

            <label>
              Monto
              <input
                type="number"
                value={editing.amount ?? ''}
                onChange={(e) => {
                  const amountValue = Number(e.target.value);

                  setEditing({
                    ...editing,
                    amount: amountValue,
                    expectedReturn: calculateExpectedReturn(
                      editing.projectId,
                      amountValue
                    )
                  });
                }}
              />
            </label>

            <label>
              Retorno esperado
              <input
                type="number"
                value={editing.expectedReturn ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    expectedReturn: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Estado
              <select
                value={editing.status || 'Registrado'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value as Investment['status']
                  })
                }
              >
                <option>Registrado</option>
                <option>En seguimiento</option>
                <option>Liquidado</option>
              </select>
            </label>

            <label>
              Fecha
              <input
                type="date"
                value={editing.createdAt || new Date().toISOString().slice(0, 10)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    createdAt: e.target.value
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}


export function TraceabilityModule({
  access,
  title = 'Trazabilidad Financiera en Blockchain'
}: {
  access: Access;
  title?: string;
}) {
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Partial<TraceabilityEvent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [cattleData, investmentsData, traceabilityData] = await Promise.all([
        getCattleFromSupabase(),
        getInvestmentsFromSupabase(),
        getTraceabilityFromSupabase()
      ]);

      setCattle(cattleData);
      setInvestments(investmentsData);
      setEvents(traceabilityData);
    } catch (error) {
      alert('No se pudo cargar el módulo de trazabilidad desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAnimal = (cattleId?: string) => {
    return cattle.find((c) => c.id === cattleId);
  };

  const getInvestment = (investmentId?: string) => {
    return investments.find((i) => i.id === investmentId);
  };

  const formatTraceDate = (value?: string) => {
    if (!value) return 'Sin fecha';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const rows = events.filter((t) => {
    const animal = getAnimal(t.cattleId);
    const investment = getInvestment(t.investmentId);

    const text = `
      ${t.hashCode || ''}
      ${t.eventType || ''}
      ${t.description || ''}
      ${animal?.code || ''}
      ${animal?.name || ''}
      ${investment?.investorName || ''}
    `;

    return lower(text).includes(lower(query));
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editing?.cattleId) {
      alert('Selecciona un animal para guardar el evento.');
      return;
    }

    if (!editing?.eventType) {
      alert('Ingresa el tipo de evento.');
      return;
    }

    try {
      setSaving(true);

      const saved = await saveTraceabilityInSupabase(editing || {});

      setEvents((current) => {
        const exists = current.some((item) => item.id === saved.id);

        if (exists) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }

        return [saved, ...current];
      });

      setEditing(null);
    } catch (error) {
      alert('No se pudo guardar el evento de trazabilidad. Revisa Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const removeEvent = async (id: string) => {
    try {
      await deleteTraceabilityFromSupabase(id);
      setEvents((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert('No se pudo eliminar el evento desde Supabase.');
    }
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Registra eventos clave, evidencia digital, vinculación inversión–ganado e historial de operaciones."
        action={
          canEdit(access) ? (
            <button
              className="primary-btn"
              onClick={() =>
                setEditing({
                  cattleId: cattle[0]?.id || '',
                  investmentId: undefined,
                  eventType: '',
                  description: '',
                  hashCode: generateTraceHash(),
                  createdAt: new Date().toISOString()
                })
              }
              disabled={!cattle.length}
            >
              <Plus size={17} /> Nuevo evento
            </button>
          ) : (
            <BlockedButton>Nuevo evento</BlockedButton>
          )
        }
      />

      {!canEdit(access) && <ReadOnlyNotice />}

      {!cattle.length && !loading && (
        <div className="readonly-notice">
          Primero registra ganado para poder crear eventos de trazabilidad.
        </div>
      )}

      <div className="filters">
        <label>
          <Search size={16} />
          <input
            placeholder="Buscar hash, evento, animal, inversión o descripción"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="table-card">
          <strong>Cargando trazabilidad desde Supabase...</strong>
        </div>
      ) : (
        <div className="trace-panel">
          {rows.map((t) => {
            const animal = getAnimal(t.cattleId);
            const investment = getInvestment(t.investmentId);

            return (
              <article key={t.id} className="trace-card">
                <div className="trace-dot-line">
                  <span />
                </div>

                <div className="trace-card-content">
                  <div className="trace-card-main">
                    <div className="trace-title-row">
                      <div>
                        <strong>{t.eventType}</strong>
                        <p>{t.description}</p>
                      </div>

                      <code>{t.hashCode}</code>
                    </div>

                    <div className="trace-details-grid">
                      <span>
                        <small>Ganado</small>
                        <b>{animal?.code || 'Sin ganado'}</b>
                      </span>

                      <span>
                        <small>Animal</small>
                        <b>{animal?.name || t.cattleId}</b>
                      </span>

                      <span>
                        <small>Inversión</small>
                        <b>
                          {investment
                            ? `${investment.investorName} · ${money(investment.amount)}`
                            : 'Sin inversión vinculada'}
                        </b>
                      </span>

                      <span>
                        <small>Fecha</small>
                        <b>{formatTraceDate(t.createdAt)}</b>
                      </span>
                    </div>
                  </div>

                  <div className="trace-actions">
                    <button
                      className="secondary-btn"
                      disabled={!canEdit(access)}
                      onClick={() => setEditing(t)}
                    >
                      Editar
                    </button>

                    <ConfirmButton
                      label="Eliminar"
                      disabled={!canEdit(access)}
                      message="¿Eliminar evento?"
                      onConfirm={() => removeEvent(t.id)}
                    />
                  </div>
                </div>
              </article>
            );
          })}

          {!rows.length && (
            <EmptyState
              title="Sin trazabilidad"
              description="No se encontraron eventos con esos filtros."
            />
          )}
        </div>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Editar evento de trazabilidad' : 'Nuevo evento de trazabilidad'}
          onClose={() => setEditing(null)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label>
              Animal
              <select
                required
                value={editing.cattleId || cattle[0]?.id || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    cattleId: e.target.value
                  })
                }
              >
                {!cattle.length && (
                  <option value="">No hay ganado registrado</option>
                )}

                {cattle.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Inversión
              <select
                value={editing.investmentId || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    investmentId: e.target.value || undefined
                  })
                }
              >
                <option value="">Sin inversión vinculada</option>

                {investments.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.investorName} · {money(i.amount)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tipo de evento
              <input
                required
                value={editing.eventType || ''}
                placeholder="Ej. Registro sanitario, financiamiento, control productivo"
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    eventType: e.target.value
                  })
                }
              />
            </label>

            <label>
              Hash simulado
              <div className="inline-field">
                <input
                  required
                  value={editing.hashCode || ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      hashCode: e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      hashCode: generateTraceHash()
                    })
                  }
                >
                  Generar
                </button>
              </div>
            </label>

            <label>
              Fecha y hora
              <input
                type="datetime-local"
                value={
                  editing.createdAt
                    ? new Date(editing.createdAt).toISOString().slice(0, 16)
                    : new Date().toISOString().slice(0, 16)
                }
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    createdAt: new Date(e.target.value).toISOString()
                  })
                }
              />
            </label>

            <label className="full">
              Descripción
              <textarea
                value={editing.description || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    description: e.target.value
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}


export function ClimateModule({
  access,
  title = 'Monitoreo Climático y Ambiental'
}: {
  access: Access;
  title?: string;
}) {
  const [records, setRecords] = useState<ClimateRecord[]>([]);
  const [location, setLocation] = useState('todos');
  const [editing, setEditing] = useState<Partial<ClimateRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const data = await getClimateFromSupabase();

      setRecords(data);
    } catch (error) {
      alert('No se pudo cargar el módulo climático desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = records.filter((c) => {
    return location === 'todos' || c.location === location;
  });

  const chart = [...rows].slice(0, 10).reverse();

  const locations = Array.from(
    new Set(records.map((c) => c.location).filter(Boolean))
  );

  const formatClimateDate = (value?: string) => {
    if (!value) return 'Sin fecha';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);

      const saved = await saveClimateInSupabase(editing || {});

      setRecords((current) => {
        const exists = current.some((item) => item.id === saved.id);

        if (exists) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }

        return [saved, ...current];
      });

      setEditing(null);
    } catch (error) {
      alert('No se pudo guardar el registro climático. Revisa Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const removeClimate = async (id: string) => {
    try {
      await deleteClimateFromSupabase(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert('No se pudo eliminar el registro climático desde Supabase.');
    }
  };

  const openRealWeatherForm = async () => {
    try {
      setFetchingWeather(true);

      const weather = await getCurrentWeatherByUserLocation();

      setEditing(weather);
    } catch (error) {
      alert(
        'No se pudo obtener el clima actual. Asegúrate de permitir la ubicación en el navegador.'
      );
    } finally {
      setFetchingWeather(false);
    }
  };

  const simulateClimateInSupabase = async () => {
    const temperature = Number((Math.random() * 12 + 16).toFixed(1));
    const humidity = Math.round(Math.random() * 45 + 45);
    const rainfall = Number((Math.random() * 18).toFixed(1));

    const eventType: ClimateRecord['eventType'] =
      temperature > 26
        ? 'Calor extremo'
        : rainfall > 9
          ? 'Lluvia'
          : humidity < 50
            ? 'Sequía'
            : 'Normal';

    try {
      setSaving(true);

      const saved = await saveClimateInSupabase({
        temperature,
        humidity,
        rainfall,
        eventType,
        location: ['Potrero Norte', 'Potrero Sur', 'Potrero Este'][
          Math.floor(Math.random() * 3)
        ],
        createdAt: new Date().toISOString()
      });

      setRecords((current) => [saved, ...current]);
    } catch (error) {
      alert('No se pudo simular el sensor IoT en Supabase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Registra temperatura ambiental, humedad, precipitaciones y eventos climáticos que impactan la producción."
        action={
          <div className="action-group">
            {canEdit(access) ? (
              <button
                className="secondary-btn"
                onClick={simulateClimateInSupabase}
                disabled={saving}
              >
                Simular sensor IoT
              </button>
            ) : (
              <BlockedButton>Simular sensor</BlockedButton>
            )}

            {canEdit(access) ? (
              <button
                className="primary-btn"
                onClick={openRealWeatherForm}
                disabled={fetchingWeather}
              >
                <Plus size={17} />
                {fetchingWeather ? 'Obteniendo clima...' : 'Nuevo clima'}
              </button>
            ) : null}
          </div>
        }
      />

      {!canEdit(access) && <ReadOnlyNotice />}

      <div className="filters">
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="todos">Todas las ubicaciones</option>

          {locations.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="table-card">
          <strong>Cargando clima desde Supabase...</strong>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="panel large-panel">
              <div className="panel-title">
                <h3>Tendencia climática</h3>
                <span>Datos de Supabase</span>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="createdAt" hide />
                  <YAxis />
                  <Tooltip />
                  <Area
                    dataKey="temperature"
                    name="Temperatura"
                    fillOpacity={0.25}
                  />
                  <Area
                    dataKey="humidity"
                    name="Humedad"
                    fillOpacity={0.18}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="panel">
              <div className="panel-title">
                <h3>Último registro</h3>
                <span>{formatClimateDate(rows[0]?.createdAt)}</span>
              </div>

              {rows[0] ? (
                <div className="weather-card">
                  <CloudSun size={46} />
                  <strong>{rows[0].temperature} °C</strong>
                  <p>
                    {rows[0].humidity}% humedad · {rows[0].rainfall} mm lluvia
                  </p>
                  <StatusBadge value={rows[0].eventType} />
                  <small>{rows[0].location}</small>
                </div>
              ) : (
                <EmptyState
                  title="Sin clima"
                  description="Registra un clima en tiempo real o simula un sensor."
                />
              )}
            </div>
          </div>

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Ubicación</th>
                  <th>Temperatura</th>
                  <th>Humedad</th>
                  <th>Lluvia</th>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>{c.location}</td>
                    <td>{c.temperature} °C</td>
                    <td>{c.humidity}%</td>
                    <td>{c.rainfall} mm</td>
                    <td>
                      <StatusBadge value={c.eventType} />
                    </td>
                    <td>{formatClimateDate(c.createdAt)}</td>
                    <td className="actions">
                      <button
                        className="secondary-btn"
                        disabled={!canEdit(access)}
                        onClick={() => setEditing(c)}
                      >
                        Editar
                      </button>

                      <ConfirmButton
                        label="Eliminar"
                        disabled={!canEdit(access)}
                        message="¿Eliminar clima?"
                        onConfirm={() => removeClimate(c.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!rows.length && (
              <EmptyState
                title="Sin registros climáticos"
                description="No se encontraron registros para esa ubicación."
              />
            )}
          </div>
        </>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Editar registro climático' : 'Registro climático en tiempo real'}
          onClose={() => setEditing(null)}
        >
          <form className="form-grid" onSubmit={submit}>
            <label>
              Temperatura
              <input
                type="number"
                step="0.1"
                value={editing.temperature ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    temperature: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Humedad
              <input
                type="number"
                value={editing.humidity ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    humidity: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Precipitaciones
              <input
                type="number"
                step="0.1"
                value={editing.rainfall ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    rainfall: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Evento
              <select
                value={editing.eventType || 'Normal'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    eventType: e.target.value as ClimateRecord['eventType']
                  })
                }
              >
                <option>Normal</option>
                <option>Lluvia</option>
                <option>Sequía</option>
                <option>Calor extremo</option>
                <option>Frío</option>
              </select>
            </label>

            <label className="full">
              Ubicación
              <input
                value={editing.location || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    location: e.target.value
                  })
                }
              />
            </label>

            <label>
              Latitud
              <input
                type="number"
                step="0.000001"
                value={editing.latitude ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    latitude: Number(e.target.value)
                  })
                }
              />
            </label>

            <label>
              Longitud
              <input
                type="number"
                step="0.000001"
                value={editing.longitude ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    longitude: Number(e.target.value)
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export function ReportsModule({
  title = 'Reportes y Dashboard Ejecutivo'
}: {
  title?: string;
}) {
  const { createAudit } = useAgro();

  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [productiveRecords, setProductiveRecords] = useState<ProductiveRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [traceabilityEvents, setTraceabilityEvents] = useState<TraceabilityEvent[]>([]);
  const [climateRecords, setClimateRecords] = useState<ClimateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const HEALTH_COLORS = ['#1f9d63', '#f5b942', '#e67e22', '#c0392b'];
  const BAR_COLORS = {
    goal: '#1f7a4d',
    raised: '#7ac77f',
    investment: '#9a6b3f'
  };

  const loadReports = async () => {
    try {
      setLoading(true);

      const [
        cattleData,
        productiveData,
        projectsData,
        investmentsData,
        traceabilityData,
        climateData
      ] = await Promise.all([
        getCattleFromSupabase(),
        getProductiveFromSupabase(),
        getProjectsFromSupabase(),
        getInvestmentsFromSupabase(),
        getTraceabilityFromSupabase(),
        getClimateFromSupabase()
      ]);

      setCattle(cattleData);
      setProductiveRecords(productiveData);
      setProjects(projectsData);
      setInvestments(investmentsData);
      setTraceabilityEvents(traceabilityData);
      setClimateRecords(climateData);
    } catch (error) {
      alert('No se pudo cargar el dashboard ejecutivo desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const healthData = [
    {
      name: 'Sano',
      value: cattle.filter((c) => c.healthStatus === 'Sano').length
    },
    {
      name: 'Observación',
      value: cattle.filter((c) => c.healthStatus === 'En observación').length
    },
    {
      name: 'Tratamiento',
      value: cattle.filter((c) => c.healthStatus === 'Tratamiento').length
    },
    {
      name: 'Alerta',
      value: cattle.filter((c) => c.healthStatus === 'Alerta sanitaria').length
    }
  ].filter((item) => item.value > 0);

  const productivity = [...productiveRecords]
    .sort((a, b) => String(a.recordDate).localeCompare(String(b.recordDate)))
    .map((r) => ({
      fecha: r.recordDate,
      peso: Number(r.weight || 0),
      leche: Number(r.milkProduction || 0)
    }));

  const financeData = projects.map((p) => ({
    proyecto:
      p.title.length > 24
        ? `${p.title.slice(0, 24)}...`
        : p.title,
    meta: Number(p.goalAmount || 0),
    recaudado: Number(p.raisedAmount || 0)
  }));

  const climateData = [...climateRecords]
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
    .slice(-10)
    .map((c) => ({
      fecha: String(c.createdAt).slice(0, 10),
      temperatura: Number(c.temperature || 0),
      humedad: Number(c.humidity || 0),
      lluvia: Number(c.rainfall || 0)
    }));

  const totalRaised = projects.reduce(
    (sum, project) => sum + Number(project.raisedAmount || 0),
    0
  );

  const totalGoal = projects.reduce(
    (sum, project) => sum + Number(project.goalAmount || 0),
    0
  );

  const totalInvested = investments.reduce(
    (sum, investment) => sum + Number(investment.amount || 0),
    0
  );

  const averageReturn = investments.length
    ? investments.reduce(
        (sum, investment) =>
          sum + Number(investment.expectedReturn || 0),
        0
      ) / investments.length
    : 0;

  const download = (type: string) => {
    if (type === 'ganado') {
      exportCsv(
        'reporte_ganado_agroganado360.csv',
        cattle as unknown as Record<string, unknown>[]
      );
    }

    if (type === 'inversiones') {
      exportCsv(
        'reporte_inversiones_agroganado360.csv',
        investments as unknown as Record<string, unknown>[]
      );
    }

    if (type === 'clima') {
      exportCsv(
        'reporte_clima_agroganado360.csv',
        climateRecords as unknown as Record<string, unknown>[]
      );
    }

    if (type === 'proyectos') {
      exportCsv(
        'reporte_proyectos_agroganado360.csv',
        projects as unknown as Record<string, unknown>[]
      );
    }

    createAudit(
      'Exportación',
      'Reportes',
      `Reporte ${type} exportado en CSV.`
    );
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Indicadores clave, visualización gráfica de tendencias y reportes exportables para toma de decisiones."
      />

      <div className="report-actions">
        <button className="primary-btn" onClick={() => download('ganado')}>
          Exportar ganado CSV
        </button>

        <button className="secondary-btn" onClick={() => download('proyectos')}>
          Exportar proyectos CSV
        </button>

        <button className="secondary-btn" onClick={() => download('inversiones')}>
          Exportar inversiones CSV
        </button>

        <button className="secondary-btn" onClick={() => download('clima')}>
          Exportar clima CSV
        </button>
      </div>

      {loading ? (
        <div className="table-card">
          <strong>Cargando reportes desde Supabase...</strong>
        </div>
      ) : (
        <>
          <div className="reports-kpi-grid">
            <div className="report-kpi-card">
              <span>Animales registrados</span>
              <strong>{cattle.length}</strong>
              <small>Gestión ganadera</small>
            </div>

            <div className="report-kpi-card">
              <span>Proyectos activos</span>
              <strong>{projects.filter((p) => p.status === 'Activo').length}</strong>
              <small>{projects.length} proyectos totales</small>
            </div>

            <div className="report-kpi-card">
              <span>Capital recaudado</span>
              <strong>{money(totalRaised)}</strong>
              <small>Meta total: {money(totalGoal)}</small>
            </div>

            <div className="report-kpi-card">
              <span>Inversiones</span>
              <strong>{money(totalInvested)}</strong>
              <small>Retorno prom.: {money(averageReturn)}</small>
            </div>

            <div className="report-kpi-card">
              <span>Eventos blockchain</span>
              <strong>{traceabilityEvents.length}</strong>
              <small>Trazabilidad digital</small>
            </div>

            <div className="report-kpi-card">
              <span>Lecturas climáticas</span>
              <strong>{climateRecords.length}</strong>
              <small>Monitoreo ambiental</small>
            </div>
          </div>

          <div className="dashboard-grid reports-dashboard-grid">
            <div className="panel report-panel">
              <div className="panel-title">
                <h3>Estado sanitario del ganado</h3>
                <span>Distribución por estado</span>
              </div>

              {healthData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={healthData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={110}
                      paddingAngle={4}
                      label
                    >
                      {healthData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={HEALTH_COLORS[index % HEALTH_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin datos sanitarios"
                  description="Registra ganado para visualizar la distribución sanitaria."
                />
              )}
            </div>

            <div className="panel report-panel large-panel">
              <div className="panel-title">
                <h3>Tendencia productiva</h3>
                <span>Peso y producción de leche</span>
              </div>

              {productivity.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={productivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e2" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      name="Peso kg"
                      stroke="#1f7a4d"
                      strokeWidth={4}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="leche"
                      name="Leche L"
                      stroke="#d99a21"
                      strokeWidth={4}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin historial productivo"
                  description="Registra peso o producción para visualizar tendencias."
                />
              )}
            </div>

            <div className="panel report-panel large-panel">
              <div className="panel-title">
                <h3>Financiamiento ganadero</h3>
                <span>Meta vs recaudado</span>
              </div>

              {financeData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={financeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e2" />
                    <XAxis dataKey="proyecto" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="meta"
                      name="Meta S/"
                      fill={BAR_COLORS.goal}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="recaudado"
                      name="Recaudado S/"
                      fill={BAR_COLORS.raised}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin proyectos"
                  description="Crea proyectos de crowdfunding para visualizar financiamiento."
                />
              )}
            </div>

            <div className="panel report-panel">
              <div className="panel-title">
                <h3>Clima y ambiente</h3>
                <span>Últimas lecturas</span>
              </div>

              {climateData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={climateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e2" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="temperatura"
                      name="Temperatura °C"
                      stroke="#d99a21"
                      fill="#f5d58a"
                      fillOpacity={0.45}
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="humedad"
                      name="Humedad %"
                      stroke="#2d8ac7"
                      fill="#b8def4"
                      fillOpacity={0.35}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin clima"
                  description="Registra lecturas climáticas para ver tendencias ambientales."
                />
              )}
            </div>
          </div>

          <div className="panel report-summary-panel">
            <div className="panel-title">
              <h3>Resumen ejecutivo</h3>
              <span>Datos integrados desde Supabase</span>
            </div>

            <div className="summary-grid">
              <div>
                <strong>{cattle.length}</strong>
                <span>Animales registrados</span>
              </div>

              <div>
                <strong>{projects.length}</strong>
                <span>Proyectos ganaderos</span>
              </div>

              <div>
                <strong>{investments.length}</strong>
                <span>Inversiones registradas</span>
              </div>

              <div>
                <strong>{traceabilityEvents.length}</strong>
                <span>Eventos blockchain</span>
              </div>

              <div>
                <strong>{climateRecords.length}</strong>
                <span>Lecturas climáticas</span>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export function AuditModule({
  access,
  title = 'Administración y Auditoría'
}: {
  access: Access;
  title?: string;
}) {
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('todos');
  const [loading, setLoading] = useState(true);

  const loadAudits = async () => {
    try {
      setLoading(true);

      const data = await getAuditsFromSupabase();

      setAudits(data);
    } catch (error) {
      alert('No se pudo cargar la auditoría desde Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const rows = audits.filter((a) => {
    const text = `${a.user || ''} ${a.action || ''} ${a.description || ''} ${a.module || ''}`;

    const matchesQuery = lower(text).includes(lower(query));
    const matchesModule = module === 'todos' || a.module === module;

    return matchesQuery && matchesModule;
  });

  const modules = Array.from(
    new Set(audits.map((a) => a.module).filter(Boolean))
  );

  const formatAuditDate = (value?: string) => {
    if (!value) return 'Sin fecha';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const removeAudit = async (id: string) => {
    try {
      await deleteAuditFromSupabase(id);
      setAudits((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert('No se pudo eliminar el registro de auditoría.');
    }
  };

  return (
    <section>
      <PageHeader
        title={title}
        description="Bitácora de acciones, monitoreo de usuarios, parámetros operativos y control de eventos del sistema."
      />

      {access !== 'crud' && <ReadOnlyNotice />}

      <div className="audit-kpi-grid">
        <div className="audit-kpi-card">
          <ShieldCheck />
          <div>
            <strong>{audits.length}</strong>
            <span>Eventos registrados</span>
          </div>
        </div>

        <div className="audit-kpi-card">
          <Activity />
          <div>
            <strong>{modules.length}</strong>
            <span>Módulos auditados</span>
          </div>
        </div>

        <div className="audit-kpi-card">
          <BarChart3 />
          <div>
            <strong>
              {
                audits.filter((a) =>
                  lower(a.action).includes('elimin')
                ).length
              }
            </strong>
            <span>Eventos críticos</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <label>
          <Search size={16} />
          <input
            placeholder="Buscar acción, usuario, módulo o descripción"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <select value={module} onChange={(e) => setModule(e.target.value)}>
          <option value="todos">Todos los módulos</option>

          {modules.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Módulo</th>
              <th>Descripción</th>
              <th>Fecha</th>
              {access === 'crud' && <th>Acciones</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={access === 'crud' ? 6 : 5}>
                  <strong>Cargando auditoría desde Supabase...</strong>
                </td>
              </tr>
            ) : (
              rows.map((a) => (
                <tr key={a.id}>
                  <td>{a.user}</td>
                  <td>
                    <StatusBadge value={a.action} />
                  </td>
                  <td>{a.module}</td>
                  <td>{a.description}</td>
                  <td>{formatAuditDate(a.createdAt)}</td>

                  {access === 'crud' && (
                    <td className="actions">
                      <ConfirmButton
                        label="Eliminar"
                        message="¿Eliminar registro de auditoría?"
                        onConfirm={() => removeAudit(a.id)}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && !rows.length && (
          <EmptyState
            title="Sin auditoría"
            description="No existen registros para esos filtros."
          />
        )}
      </div>

      <div className="parameters-grid">
        <div className="param-card">
          <ShieldCheck />
          <strong>Seguridad</strong>
          <span>Registro centralizado de eventos del sistema.</span>
        </div>

        <div className="param-card">
          <Activity />
          <strong>Auditoría</strong>
          <span>Las acciones se guardan en Supabase para consulta histórica.</span>
        </div>

        <div className="param-card">
          <BarChart3 />
          <strong>Control</strong>
          <span>Seguimiento por usuario, módulo, acción y fecha.</span>
        </div>
      </div>
    </section>
  );
}
