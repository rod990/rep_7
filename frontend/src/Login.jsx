import { useState } from 'react';
import { apiFetch, mensajeDeError } from './api';

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
            const data = await apiFetch('/login/', { method: 'POST', body: { username, password } });
            localStorage.setItem('token', data.token);
            setAuthToken(data.token);
        } catch (err) {
            // DRF responde 400 cuando usuario/contraseña no coinciden
            setError(err.status === 400 ? 'Usuario o contraseña incorrectos.' : mensajeDeError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <form className="tarjeta login-tarjeta" onSubmit={handleLogin}>
                <h1 className="login-titulo">MiMusica</h1>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>Inicia sesión para continuar</p>

                {error && <div className="aviso-error">{error}</div>}

                <label className="campo">
                    Usuario
                    <input className="input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label className="campo">
                    Contraseña
                    <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>

                <button type="submit" className="btn-primario ancho" disabled={loading}>
                    {loading ? 'Verificando…' : 'Ingresar'}
                </button>
            </form>
        </div>
    );
}
