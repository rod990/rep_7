import {useState,useEffect } from 'react';
export default function Canciones({ token }) {
    const [canciones,setCanciones]=useState([]);
    const [titulo,setTitulo]=useState('');
    const [artista,setArtista]=useState('');
    const [genero,setGenero]=useState('');
    const [editandoId, setEditandoId]=useState(null);
    const [error, setError]=useState('');
    const API_URL='http://127.0.0.1:8000/api/canciones/';
    const fetchCanciones=async()=>{
        try {
            const response=await fetch(API_URL,{
                headers:{
                    'Authorization':`Token ${token}`
                }
            });
            if (response.ok) {
                const data=await response.json();
                setCanciones(data);
            } else {
                setError('Error al cargar las canciones.');
            }
        } catch(err){
            setError('Error de conexión con el servidor.');
        }
    };
    useEffect(()=>{
        fetchCanciones();
    }, []);
    const handleSubmit = async(e)=>{
        e.preventDefault();
        const metodo=editandoId?'PUT':'POST';
        const urlFinal=editandoId?`${API_URL}${editandoId}/`:API_URL;
        try {
            const response=awaitfetch(urlFinal, {
                method:metodo,
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Token ${token}`
                },
                body: JSON.stringify({ titulo, artista, genero })
            });
            if (response.ok) {
                setTitulo('');
                setArtista('');
                setGenero('');
                setEditandoId(null);
                fetchCanciones();
            } else {
                setError('No se pudo guardar la canción.');
            }
        } catch (err) {
            setError('Error en la operación.');
        }
    };
    const handleEditar = (cancion) => {
        setEditandoId(cancion.id);
        setTitulo(cancion.titulo);
        setArtista(cancion.artista);
        setGenero(cancion.genero);
    };
    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta canción?')) return;
        try {
            const response = await fetch(`${API_URL}${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            if (response.ok) {
                fetchCanciones();
            } else {
                setError('No se pudo eliminar la canción.');
            }
        } catch (err) {
            setError('Error al eliminar.');
        }
    };
    return(
        <div style={{marginTop:'20px'}}>
            <h3>{editandoId?'Editar Canción':'Agregar Nueva Canción'}</h3>
            {error && <p style={{ color:'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}style={{display:'flex',gap:'10px',marginBottom:'20px'}}>
                <input 
                    type="text" 
                    placeholder="Título" 
                    value={titulo} 
                    onChange={(e)=>setTitulo(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Artista" 
                    value={artista} 
                    onChange={(e) => setArtista(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Género" 
                    value={genero} 
                    onChange={(e) => setGenero(e.target.value)} 
                    required 
                />
                <button type="submit" style={{background:'#28a745',color:'white',border:'none', padding:'8px 12px',cursor:'pointer' }}>
                    {editandoId?'Actualizar':'Guardar'}
                </button>
                {editandoId&&(
                    <button type="button" onClick={() => {setEditandoId(null);setTitulo('');setArtista(''); setGenero(''); }}>
                        Cancelar
                    </button>
                )}
            </form>

            <h3>Lista de Canciones</h3>
            <table border="1" cellPadding="10" style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                    <tr style={{ background:'#f2f2f2'}}>
                        <th>Título</th>
                        <th>Artista</th>
                        <th>Género</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {canciones.length===0?(
                        <tr><td colSpan="4" style={{textAlign:'center'}}>No hay canciones registradas.</td></tr>
                    ) : (
                        canciones.map((c) => (
                            <tr key={c.id}>
                                <td>{c.titulo}</td>
                                <td>{c.artista}</td>
                                <td>{c.genero}</td>
                                <td>
                                    <button onClick={() => handleEditar(c)} style={{ marginRight: '5px', background: '#ffc107', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Editar</button>
                                    <button onClick={() => handleEliminar(c.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}