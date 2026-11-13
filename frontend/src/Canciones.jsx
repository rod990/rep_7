import { useState, useEffect } from 'react';
export default function Canciones({ token }) {
    const [canciones, setCanciones] = useState([]);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [resultadosApi, setResultadosApi] = useState([]);
    const API_URL = 'http://127.0.0.1:8000/api/canciones/';
    const cargarCanciones = async () => {
        try {
            const res = await fetch(API_URL, { headers: { 'Authorization': `Token ${token}` } });
            if (res.ok) { const data = await res.json(); setCanciones(data); }
        } catch (err) { console.error(err); }
    };
    useEffect(() => { cargarCanciones(); }, []);
    useEffect(() => {
        const buscarEnTiempoReal = async () => {
            if (!busqueda.trim()) { setResultadosApi([]); return; }
            try {
                const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(busqueda)}&entity=song&limit=5`);
                const data = await res.json();
                setResultadosApi(data.results || []);
            } catch (err) { console.error(err); }
        };
        const timer = setTimeout(() => { buscarEnTiempoReal(); }, 300);
        return () => clearTimeout(timer);
    }, [busqueda]);
    const importarDesdeApi = async (track) => {
        const nuevaCancion = {
            titulo: track.trackName || 'Sin título',
            artista: track.artistName || 'Desconocido',
            genero: track.primaryGenreName || 'General',
            anio_lanzamiento: track.releaseDate ? new Date(track.releaseDate).getFullYear() : 2024
        };
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                body: JSON.stringify(nuevaCancion)
            });
            if (res.ok) { cargarCanciones(); setBusqueda(''); setResultadosApi([]); }
            else { const data = await res.json(); setError(JSON.stringify(data)); }
        } catch (err) { setError('Error de conexión.'); }
    };
    const eliminarCancion = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta canción?')) return;
        try {
            const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}` } });
            if (res.ok) { cargarCanciones(); }
        } catch (err) { console.error(err); }
    };
    return (
        <div className="py-2" style={{ color: '#fff', fontFamily: '"Times New Roman", Times, serif', letterSpacing: '0.3px' }}>
            <div className="p-4 mb-4 rounded border border-secondary" style={{ backgroundColor: '#0a0a0a' }}>
                <h5 className="mb-3 text-uppercase fw-bold text-white" style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>Buscador</h5>
                <input type="text" className="form-control text-white border-secondary shadow-none" style={{ backgroundColor: '#000', padding: '12px', color: '#fff', fontFamily: '"Times New Roman", Times, serif' }} placeholder="Escribe el nombre de una canción o artista..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}
                {resultadosApi.length > 0 && (
                    <div className="table-responsive rounded border border-secondary mt-3" style={{ backgroundColor: '#000' }}>
                        <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                            <tbody>
                                {resultadosApi.map((item, index) => {
                                    const qYt = encodeURIComponent(`${item.trackName} ${item.artistName}`);
                                    const linkYt = `https://www.youtube.com/results?search_query=${qYt}`;
                                    const linkApple = item.trackViewUrl || `https://music.apple.com/us/search?term=${encodeURIComponent(item.trackName + ' ' + item.artistName)}`;
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
                        {canciones.length === 0 ? (
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