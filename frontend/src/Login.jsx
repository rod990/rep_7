import {useState} from 'react';
export default function Login({ setAuthToken }) {
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [error,setError]=useState('');
    const [loading,setLoading]=useState(false);
    const handleLogin=async(e)=>{
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response=await fetch('http://127.0.0.1:8000/api/login/',{
                method:'POST',
                headers:{'Content-Type':'application/json' },
                body:JSON.stringify({username, password })
            });
            const data=await response.json();
            if (response.ok){
                localStorage.setItem('token', data.token);
                setAuthToken(data.token);
            } else {
                setError('Usuario o contraseña incorrectos. Intenta de nuevo.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{maxWidth:'400px',margin:'50px auto',fontFamily:'sans-serif',padding:'20px',border:'1px solid #ccc', borderRadius: '8px' }}>
            <h2>Iniciar Sesión - Repositorio Musical</h2>
            <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'15px'}}>
                <input 
                    type="text" 
                    placeholder="Usuario" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                    style={{padding:'8px',fontSize:'16px'}}
                />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={(e)=>setPassword(e.target.value)} 
                    required 
                    style={{padding:'8px',fontSize:'16px'}}
                />
                <button type="submit"disabled={loading}style={{padding:'10px',fontSize:'16px',background:'#007bff',color:'white',border:'none',cursor:'pointer' }}>
                    {loading?'Cargando...' : 'Entrar'}
                </button>
            </form>
            {error && <p style={{ color:'red',marginTop:'10px'}}>{error}</p>}
        </div>
    );
}