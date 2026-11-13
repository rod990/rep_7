import { useState } from 'react';
export default function Login({ setAuthToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                setAuthToken(data.token);
            } else {
                setError('Credenciales incorrectas. Verifique sus datos.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-black text-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <div className="card border border-secondary shadow-lg p-5" style={{ width: '100%', maxWidth: '420px', backgroundColor: '#0a0a0a' }}>
                <div className="text-center mb-4">
                    <div className="text-danger fw-bold mb-2" style={{ fontSize: '1.8rem', letterSpacing: '2px' }}>MI MUSICA</div>
                    <p className="text-light opacity-50 small uppercase" style={{ letterSpacing: '1.5px' }}>Acceso al Repositorio</p>
                </div>
                {error && <div className="alert alert-danger py-2 text-center small mb-3">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label text-light small text-uppercase" style={{ letterSpacing: '1px' }}>Usuario</label>
                        <input type="text" className="form-control text-white border-secondary shadow-none py-2" style={{ backgroundColor: '#000', fontFamily: '"Times New Roman", Times, serif' }} value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-light small text-uppercase" style={{ letterSpacing: '1px' }}>Contraseña</label>
                        <input type="password" className="form-control text-white border-secondary shadow-none py-2" style={{ backgroundColor: '#000', fontFamily: '"Times New Roman", Times, serif' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-danger w-100 py-2 fw-semibold text-uppercase" style={{ letterSpacing: '1.5px', fontSize: '0.85rem' }} disabled={loading}>
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}