import { useState, useEffect } from 'react';
import { apiFetch, mensajeDeError } from './api';

const FUENTE = '"Times New Roman", Times, serif';
const FORM_VACIO = { titulo: '', artista: '', genero: '', anio_lanzamiento: '' };
const estiloInput = { backgroundColor: '#000', color: '#fff', fontFamily: FUENTE };

export default function Canciones({ token, onSesionExpirada }) {
    const [canciones, setCanciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // formulario de crear / editar
    const [form, setForm] = useState(FORM_VACIO);
    const [editandoId, setEditandoId] = useState(null); // null = creando
    const [guardando, setGuardando] = useState(false);
    const [errorForm, setErrorForm] = useState('');

    // buscador iTunes (opcional)
    const [busqueda, setBusqueda] = useState('');
    const [resultadosApi, setResultadosApi] = useState([]);

    // 401 = token invalido/expirado -> volver al login. Otros errores -> mensaje.
    const manejarError = (err, mostrar) => {
        if (err.status === 401) { onSesionExpirada(); return; }
        mostrar(mensajeDeError(err));
    };

    // ---------- READ (GET /api/canciones/) ----------
    const cargarCanciones = async () => {
        try {
            const data = await apiFetch('/canciones/', { token });
            setCanciones(data);
            setError('');
        } catch (err) {
            manejarError(err, setError);
        } finally {
            setCargando(false);
        }
    };
    useEffect(() => { cargarCanciones(); }, []);

    // ---------- CREATE (POST) y UPDATE (PUT) desde el formulario ----------
    const cambiarCampo = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const cancelarEdicion = () => {
        setForm(FORM_VACIO);
        setEditandoId(null);
        setErrorForm('');
    };

    const empezarEdicion = (c) => {
        setForm({
            titulo: c.titulo,
            artista: c.artista,
            genero: c.genero,
            anio_lanzamiento: String(c.anio_lanzamiento),
        });
        setEditandoId(c.id);
        setErrorForm('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setErrorForm('');
        const payload = {
            ...form,
            anio_lanzamiento: form.anio_lanzamiento === '' ? null : Number(form.anio_lanzamiento),
        };
        try {
            if (editandoId) {
                await apiFetch(`/canciones/${editandoId}/`, { method: 'PUT', token, body: payload });
            } else {
                await apiFetch('/canciones/', { method: 'POST', token, body: payload });
            }
            cancelarEdicion();
            await cargarCanciones(); // la lista se actualiza sin recargar la pagina
        } catch (err) {
            manejarError(err, setErrorForm); // ej: 400 del backend con el detalle de validacion
        } finally {
            setGuardando(false);
        }
    };

    // ---------- DELETE ----------
    const eliminarCancion = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta canción?')) return;
        try {
            await apiFetch(`/canciones/${id}/`, { method: 'DELETE', token });
            if (editandoId === id) cancelarEdicion();
            await cargarCanciones();
        } catch (err) {
            manejarError(err, setError);
        }
    };

    // ---------- Buscador iTunes (con espera de 300 ms) ----------
    useEffect(() => {
        if (!busqueda.trim()) { setResultadosApi([]); return; }
        let cancelado = false;
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(busqueda)}&entity=song&limit=5`);
                const data = await res.json();
                if (!cancelado) setResultadosApi(data.results || []);
            } catch {
                if (!cancelado) setError('No se pudo consultar el buscador de iTunes.');
            }
        }, 300);
        return () => { cancelado = true; clearTimeout(timer); };
    }, [busqueda]);

    const importarDesdeApi = async (track) => {
        const nueva = {
            titulo: track.trackName || 'Sin título',
            artista: track.artistName || 'Desconocido',
            genero: track.primaryGenreName || 'General',
            anio_lanzamiento: track.releaseDate ? new Date(track.releaseDate).getFullYear() : 2024,
        };
        try {
            await apiFetch('/canciones/', { method: 'POST', token, body: nueva });
            setBusqueda('');
            setResultadosApi([]);
            setError('');
            await cargarCanciones();
        } catch (err) {
            manejarError(err, setError);
        }
    };

    return (
        <div className="py-2" style={{ color: '#fff', fontFamily: FUENTE, letterSpacing: '0.3px' }}>
            {error && <div className="alert alert-danger py-2 mb-4">{error}</div>}

            {/* Formulario crear / editar */}
            <div className="p-4 mb-4 rounded border border-secondary" style={{ backgroundColor: '#0a0a0a' }}>
                <h5 className="mb-3 text-uppercase fw-bold text-white" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>
                    {editandoId ? 'Editar canción' : 'Agregar canción'}
                </h5>
                {errorForm && <div className="alert alert-danger py-2">{errorForm}</div>}
                {/* Sin min/max a proposito: la validacion la hace el backend y aqui se muestra su error. */}
                <form onSubmit={guardar} className="row g-2">
                    <div className="col-md-3">
                        <input type="text" name="titulo" className="form-control border-secondary shadow-none" style={estiloInput} placeholder="Título" value={form.titulo} onChange={cambiarCampo} maxLength={200} required />
                    </div>
                    <div className="col-md-3">
                        <input type="text" name="artista" className="form-control border-secondary shadow-none" style={estiloInput} placeholder="Artista" value={form.artista} onChange={cambiarCampo} maxLength={200} required />
                    </div>
                    <div className="col-md-3">
                        <input type="text" name="genero" className="form-control border-secondary shadow-none" style={estiloInput} placeholder="Género" value={form.genero} onChange={cambiarCampo} maxLength={100} required />
                    </div>
                    <div className="col-md-3">
                        <input type="number" name="anio_lanzamiento" className="form-control border-secondary shadow-none" style={estiloInput} placeholder="Año" value={form.anio_lanzamiento} onChange={cambiarCampo} required />
                    </div>
                    <div className="col-12 d-flex gap-2 mt-2">
                        <button type="submit" className="btn btn-danger px-4 fw-semibold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }} disabled={guardando}>
                            {guardando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Agregar')}
                        </button>
                        {editandoId && (
                            <button type="button" className="btn btn-outline-light px-4 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }} onClick={cancelarEdicion}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Buscador iTunes */}
            <div className="p-4 mb-4 rounded border border-secondary" style={{ backgroundColor: '#0a0a0a' }}>
                <h5 className="mb-3 text-uppercase fw-bold text-white" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>Buscador</h5>
                <input type="text" className="form-control text-white border-secondary shadow-none" style={{ ...estiloInput, padding: '12px' }} placeholder="Escribe el nombre de una canción o artista..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                {resultadosApi.length > 0 && (
                    <div className="table-responsive rounded border border-secondary mt-3" style={{ backgroundColor: '#000' }}>
                        <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                            <tbody>
                                {resultadosApi.map((item, index) => {
                                    const qYt = encodeURIComponent(`${item.trackName} ${item.artistName}`);
                                    const linkYt = `https://www.youtube.com/results?search_query=${qYt}`;
                                    const linkApple = item.trackViewUrl || `https://music.apple.com/us/search?term=${qYt}`;
                                    return (
                                        <tr key={index} style={{ borderBottomColor: '#222' }}>
                                            <td className="py-3">
                                                <div className="fw-bold text-white" style={{ fontSize: '1.05rem' }}>{item.trackName}</div>
                                                <div className="text-light opacity-75 small">{item.artistName}</div>
                                            </td>
                                            <td className="text-end py-3">
                                                <a href={linkApple} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light me-2 border-secondary" style={{ fontSize: '0.8rem' }}>Apple Music</a>
                                                <a href={linkYt} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger me-2" style={{ fontSize: '0.8rem' }}>YouTube</a>
                                                <button className="btn btn-sm btn-danger px-3 text-white fw-semibold" style={{ fontSize: '0.8rem' }} onClick={() => importarDesdeApi(item)}>Agregar</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Listado */}
            <h5 className="mb-3 text-uppercase fw-bold text-white" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>Tu Repositorio</h5>
            <div className="table-responsive rounded border border-secondary" style={{ backgroundColor: '#0a0a0a' }}>
                <table className="table table-dark table-hover align-middle mb-0">
                    <thead>
                        <tr className="text-white small text-uppercase" style={{ borderBottom: '1px solid #333', backgroundColor: '#111', letterSpacing: '1px' }}>
                            <th className="py-3 ps-3 text-white">Título</th>
                            <th className="py-3 text-white">Artista</th>
                            <th className="py-3 text-white">Género</th>
                            <th className="py-3 text-white">Año</th>
                            <th className="py-3 text-center text-white">Enlaces</th>
                            <th className="py-3 text-center pe-3 text-white">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr><td colSpan="6" className="text-center py-5 text-light opacity-75">Cargando canciones...</td></tr>
                        ) : canciones.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-5 text-light opacity-75">No hay canciones registradas.</td></tr>
                        ) : (
                            canciones.map((c) => {
                                const q = encodeURIComponent(`${c.titulo} ${c.artista}`);
                                const linkYt = `https://www.youtube.com/results?search_query=${q}`;
                                const linkApple = `https://music.apple.com/us/search?term=${q}`;
                                return (
                                    <tr key={c.id} style={{ borderBottomColor: '#222' }}>
                                        <td className="fw-semibold text-white ps-3 py-3" style={{ fontSize: '1.05rem' }}>{c.titulo}</td>
                                        <td className="py-3 text-white">{c.artista}</td>
                                        <td className="py-3"><span className="badge bg-dark border border-secondary text-white">{c.genero}</span></td>
                                        <td className="py-3 text-white">{c.anio_lanzamiento}</td>
                                        <td className="text-center py-3">
                                            <a href={linkApple} target="_blank" rel="noreferrer" className="btn btn-sm btn-dark border-secondary text-white me-1 px-2 py-1" style={{ fontSize: '0.75rem' }}>Apple Music</a>
                                            <a href={linkYt} target="_blank" rel="noreferrer" className="btn btn-sm btn-dark border-danger text-danger px-2 py-1" style={{ fontSize: '0.75rem' }}>YouTube</a>
                                        </td>
                                        <td className="text-center py-3 pe-3">
                                            <button onClick={() => empezarEdicion(c)} className="btn btn-sm btn-outline-light px-3 py-1 me-2" style={{ fontSize: '0.75rem' }}>Editar</button>
                                            <button onClick={() => eliminarCancion(c.id)} className="btn btn-sm btn-outline-danger px-3 py-1 text-white" style={{ fontSize: '0.75rem' }}>Eliminar</button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
