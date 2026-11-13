import { useState, useEffect } from 'react';
import Login from './Login';
import Canciones from './Canciones';
function App() {
  const [authToken, setAuthToken] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { setAuthToken(token); }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
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
        <Canciones token={authToken} />
      </main>
    </div>
  );
}
export default App;