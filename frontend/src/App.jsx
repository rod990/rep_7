import { useState } from 'react';
import Login from './Login';
import Canciones from './Canciones';
import { apiFetch } from './api';
import './estilo.css';

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

  if (!authToken) return <Login setAuthToken={setAuthToken} />;

  return (
    <div className="app">
      <header className="barra">
        <span className="marca">
          <span className="punto" />
          MiMusica
        </span>
        <button className="btn-fantasma" onClick={handleLogout}>Cerrar sesión</button>
      </header>
      <main className="contenedor">
        <Canciones token={authToken} onSesionExpirada={limpiarSesion} />
      </main>
    </div>
  );
}

export default App;
