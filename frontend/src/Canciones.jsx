import { useState, useEffect } from 'react';
import { apiFetch, mensajeDeError } from './api';
import Reproductor from './Reproductor';

const FORM_VACIO = { titulo: '', artista: '', genero: '', anio_lanzamiento: '' };

export default function Canciones({ token, onSesionExpirada }) {
    const [canciones, setCanciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // edición (las canciones solo se crean desde el buscador de Deezer)
    const [form, setForm] = useState(FORM_VACIO);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [errorForm, setErrorForm] = useState('');

    // buscador (consulta nuestra API /api/buscar/, que consulta Deezer)
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [siguiente, setSiguiente] = useState(0); // índice de Deezer para la página siguiente
    const [hayMas, setHayMas] = useState(false);
    const [cargandoMas, setCargandoMas] = useState(false);

    // alta manual: plegada en "Agregar manualmente" (la pauta pide creación mediante formulario)
    const [nueva, setNueva] = useState(FORM_VACIO);
    const [guardandoNueva, setGuardandoNueva] = useState(false);
    const [errorNueva, setErrorNueva] = useState('');

    // canción que suena en el reproductor (null = cerrado)
    const [pista, setPista] = useState(null);

    // 401 = token invalido/expirado -> volver al login. Otros errores -> mensaje.
    const manejarError = (err, mostrar) => {
        if (err.status === 401) { onSesionExpirada(); return; }
        mostrar(mensajeDeError(err));
    };

    // ---------- READ ----------
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

    // ---------- UPDATE (PUT) ----------
    const cambiarCampo = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

    const cancelarEdicion = () => {
        setForm(FORM_VACIO);
        setEditandoId(null);
        setErrorForm('');
    };

    const guardarEdicion = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setErrorForm('');
        const payload = {
            ...form,
            anio_lanzamiento: form.anio_lanzamiento === '' ? null : Number(form.anio_lanzamiento),
        };
        try {
            await apiFetch(`/canciones/${editandoId}/`, { method: 'PUT', token, body: payload });
            cancelarEdicion();
            await cargarCanciones();
        } catch (err) {
            manejarError(err, setErrorForm);
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
            if (pista?.id === id) setPista(null);
            await cargarCanciones();
        } catch (err) {
            manejarError(err, setError);
        }
    };

    // ---------- Buscador (Deezer vía nuestra API), con espera de 300 ms ----------
    useEffect(() => {
        const q = busqueda.trim();
        if (q.length < 2) { setResultados([]); setHayMas(false); setBuscando(false); return; }
        let cancelado = false;
        setBuscando(true);
        const timer = setTimeout(async () => {
            try {
                const data = await apiFetch(`/buscar/?q=${encodeURIComponent(q)}`, { token });
                if (!cancelado) {
                    setResultados(data.resultados);
                    setSiguiente(data.siguiente);
                    setHayMas(data.hay_mas);
                }
            } catch (err) {
                if (!cancelado) manejarError(err, setError);
            } finally {
                if (!cancelado) setBuscando(false);
            }
        }, 300);
        return () => { cancelado = true; clearTimeout(timer); };
    }, [busqueda, token]);

    // ¿Ya está en la biblioteca? Compara título y artista sin importar mayúsculas.
    const esDuplicada = (titulo, artista) =>
        canciones.some(
            (c) =>
                c.titulo.trim().toLowerCase() === titulo.trim().toLowerCase() &&
                c.artista.trim().toLowerCase() === artista.trim().toLowerCase(),
        );

    // Trae la siguiente página de resultados y la agrega al final de la lista.
    const cargarMas = async () => {
        setCargandoMas(true);
        try {
            const data = await apiFetch(
                `/buscar/?q=${encodeURIComponent(busqueda.trim())}&index=${siguiente}`,
                { token },
            );
            setResultados((prev) => [...prev, ...data.resultados]);
            setSiguiente(data.siguiente);
            setHayMas(data.hay_mas);
        } catch (err) {
            manejarError(err, setError);
        } finally {
            setCargandoMas(false);
        }
    };

    // Guarda en la base de datos un resultado de Deezer (con su preview y portada).
    const agregarDesdeDeezer = async (track) => {
        if (esDuplicada(track.titulo, track.artista)) {
            window.alert('Ya tienes esta canción en tu biblioteca.');
            return;
        }
        const nueva = {
            titulo: track.titulo,
            artista: track.artista,
            genero: track.genero,
            anio_lanzamiento: track.anio_lanzamiento,
            preview_url: track.preview_url,
            portada: track.portada,
        };
        try {
            await apiFetch('/canciones/', { method: 'POST', token, body: nueva });
            // Quita solo la canción agregada; la búsqueda y las demás se mantienen.
            setResultados((prev) => prev.filter((r) => r !== track));
            setError('');
            await cargarCanciones();
        } catch (err) {
            manejarError(err, setError);
        }
    };

    // ---------- CREATE manual (POST) ----------
    const cambiarNueva = (e) => setNueva({ ...nueva, [e.target.name]: e.target.value });

    const crearManual = async (e) => {
        e.preventDefault();
        if (esDuplicada(nueva.titulo, nueva.artista)) {
            window.alert('Ya tienes esta canción en tu biblioteca.');
            return;
        }
        setGuardandoNueva(true);
        setErrorNueva('');
        const payload = {
            ...nueva,
            anio_lanzamiento: nueva.anio_lanzamiento === '' ? null : Number(nueva.anio_lanzamiento),
        };
        try {
            await apiFetch('/canciones/', { method: 'POST', token, body: payload });
            setNueva(FORM_VACIO);
            await cargarCanciones();
        } catch (err) {
            manejarError(err, setErrorNueva);
        } finally {
            setGuardandoNueva(false);
        }
    };

    const reproducibles = canciones.filter((c) => c.preview_url);

    return (
        <div className={pista ? 'pb-espacio' : ''}>
            {error && <div className="aviso-error">{error}</div>}

            {/* Buscador */}
            <section className="bloque">
                <h2 className="titulo-seccion">Buscar en Deezer</h2>
                <input
                    className="input buscador"
                    type="text"
                    placeholder="Nombre de una canción o artista"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />

                {buscando && <p className="muted" style={{ margin: '14px 0 0' }}>Buscando…</p>}

                {resultados.length > 0 && (
                    <ul className="lista" style={{ marginTop: 14 }}>
                        {resultados.map((item, i) => (
                            <li className="fila" key={i}>
                                {item.portada && <img className="portada" src={item.portada} alt="" />}
                                <div className="info">
                                    <div className="titulo-cancion">{item.titulo}</div>
                                    <div className="sub">{item.artista} · {item.anio_lanzamiento} · {item.genero}</div>
                                </div>
                                <div className="acciones">
                                    {item.preview_url && (
                                        <button className="btn-fantasma" onClick={() => setPista(item)}>Escuchar</button>
                                    )}
                                    <button className="btn-primario btn-primario-sm" onClick={() => agregarDesdeDeezer(item)}>Agregar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {hayMas && (
                    <div className="cargar-mas">
                        <button className="btn-fantasma" onClick={cargarMas} disabled={cargandoMas}>
                            {cargandoMas ? 'Cargando…' : 'Cargar más'}
                        </button>
                    </div>
                )}
            </section>

            {/* Alta manual, plegada para no competir con el buscador */}
            <details className="bloque alta-manual">
                <summary className="muted">Agregar manualmente</summary>
                <form className="tarjeta" onSubmit={crearManual} style={{ marginTop: 14 }}>
                    {errorNueva && <div className="aviso-error">{errorNueva}</div>}
                    <div className="campos">
                        <label className="campo">Título
                            <input className="input" type="text" name="titulo" value={nueva.titulo} onChange={cambiarNueva} maxLength={200} required />
                        </label>
                        <label className="campo">Artista
                            <input className="input" type="text" name="artista" value={nueva.artista} onChange={cambiarNueva} maxLength={200} required />
                        </label>
                        <label className="campo">Género
                            <input className="input" type="text" name="genero" value={nueva.genero} onChange={cambiarNueva} maxLength={100} required />
                        </label>
                        <label className="campo">Año
                            <input className="input" type="number" name="anio_lanzamiento" value={nueva.anio_lanzamiento} onChange={cambiarNueva} required />
                        </label>
                    </div>
                    <div className="acciones-form">
                        <button type="submit" className="btn-primario" disabled={guardandoNueva}>
                            {guardandoNueva ? 'Guardando…' : 'Agregar'}
                        </button>
                    </div>
                </form>
            </details>

            {/* Edición (solo aparece al presionar "Editar") */}
            {editandoId && (
                <form className="tarjeta bloque" onSubmit={guardarEdicion}>
                    <h2 className="titulo-seccion" style={{ marginBottom: 16 }}>Editar canción</h2>
                    {errorForm && <div className="aviso-error">{errorForm}</div>}
                    <div className="campos">
                        <label className="campo">Título
                            <input className="input" type="text" name="titulo" value={form.titulo} onChange={cambiarCampo} maxLength={200} required />
                        </label>
                        <label className="campo">Artista
                            <input className="input" type="text" name="artista" value={form.artista} onChange={cambiarCampo} maxLength={200} required />
                        </label>
                        <label className="campo">Género
                            <input className="input" type="text" name="genero" value={form.genero} onChange={cambiarCampo} maxLength={100} required />
                        </label>
                        <label className="campo">Año
                            <input className="input" type="number" name="anio_lanzamiento" value={form.anio_lanzamiento} onChange={cambiarCampo} required />
                        </label>
                    </div>
                    <div className="acciones-form">
                        <button type="button" className="btn-fantasma" onClick={cancelarEdicion}>Cancelar</button>
                        <button type="submit" className="btn-primario" disabled={guardando}>
                            {guardando ? 'Guardando…' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            )}

            {/* Biblioteca */}
            <section className="bloque">
                <h2 className="titulo-seccion">
                    Mi biblioteca <span>{canciones.length}</span>
                </h2>

                {cargando ? (
                    <p className="muted vacio">Cargando…</p>
                ) : canciones.length === 0 ? (
                    <p className="muted vacio">Aún no hay canciones. Búscalas arriba para agregarlas.</p>
                ) : (
                    <ul className="lista">
                        {canciones.map((c) => (
                            <li className="fila" key={c.id}>
                                {c.portada && <img className="portada" src={c.portada} alt="" />}
                                <div className="info">
                                    <div className="titulo-cancion">{c.titulo}</div>
                                    <div className="sub">{c.artista} · {c.anio_lanzamiento} · {c.genero}</div>
                                </div>
                                <div className="acciones">
                                    {c.preview_url && (
                                        <button className="btn-icono" aria-label={`Reproducir ${c.titulo}`} onClick={() => setPista(c)}>▶</button>
                                    )}
                                    <button className="btn-fantasma" onClick={() => empezarEdicion(c)}>Editar</button>
                                    <button className="btn-fantasma peligro" onClick={() => eliminarCancion(c.id)}>Eliminar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {pista && (
                <Reproductor
                    pista={pista}
                    lista={reproducibles}
                    onCambiarPista={setPista}
                    onCerrar={() => setPista(null)}
                />
            )}
        </div>
    );
}
