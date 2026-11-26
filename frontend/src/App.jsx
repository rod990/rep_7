import { useState } from 'react';
import Login from './Login';
import Canciones from './Canciones';
import { apiFetch } from './api';
import './estilo.css';
function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
  const limpiarSesion = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
  };
  const handleLogout = async () => {
    try {
      await apiFetch('/logout/', { method: 'POST', token: authToken });
    } catch {
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
