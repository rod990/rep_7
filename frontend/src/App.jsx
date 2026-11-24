import { useState } from 'react';
import Login from './Login';
import Canciones from './Canciones';
import { apiFetch } from './api';

function App() {
  // Se lee el token al crear el estado: evita el "parpadeo" del login al recargar.
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));

  const limpiarSesion = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  // Cierre de sesion: avisa al backend (borra el token) y limpia el navegador.
  const handleLogout = async () => {
    try {
      await apiFetch('/logout/', { method: 'POST', token: authToken });
    } catch {
      // si el backend no responde, igual se cierra la sesion localmente
    }
    limpiarSesion();
  };

  if (!authToken) { return <Login setAuthToken={setAuthToken} />; }
  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: '"Times New Roman", Times, serif' }}>
      <nav className="navbar px-5 py-3 border-bottom border-danger shadow-sm" style={{ backgroundColor: '#050505' }}>
        <span className="navbar-brand mb-0 h1 d-flex align-items-center gap-2 text-white fw-bold tracking-wider" style={{ letterSpacing: '1px', fontSize: '1.25rem' }}>
          <span style={{ color: '#dc3545', fontSize: '1.4rem' }}>▪</span> MiMusica
        </span>
        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm px-4 py-2 text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
          Cerrar Sesión
        </button>
      </nav>
      <main className="container my-5" style={{ maxWidth: '1100px' }}>
        <Canciones token={authToken} onSesionExpirada={limpiarSesion} />
      </main>
    </div>
  );
}
export default App;
