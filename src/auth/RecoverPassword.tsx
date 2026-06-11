import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAgro } from '../shared/store';

export default function RecoverPassword() {
  const { setNotice } = useAgro();
  return (
    <div className="recover-page">
      <div className="recover-card">
        <div className="brand"><div className="brand-mark"><Sprout /></div><div><b>AgroGanado 360</b><span>Seguridad</span></div></div>
        <h1>Recuperar contraseña</h1>
        <p>En este PMV se simula el envío de instrucciones. Al conectar Supabase se podrá usar Auth real.</p>
        <label>Correo electrónico<input type="email" placeholder="usuario@empresa.com" /></label>
        <button className="primary-btn full-btn" onClick={() => setNotice('Correo de recuperación simulado correctamente.')}>Enviar instrucciones</button>
        <Link to="/login" className="recover-link">Volver al login</Link>
      </div>
    </div>
  );
}
