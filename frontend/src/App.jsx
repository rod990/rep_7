import { useState, useEffect } from 'react';
import Login from './Login';
import Canciones from './Canciones';
function App() {
  const [authToken, setAuthToken]=useState(null);

  useEffect(()=>{
    const token=localStorage.getItem('token');
    if (token){
      setAuthToken(token);
    }
  }, []);
  const handleLogout=() =>{
    localStorage.removeItem('token');
    setAuthToken(null);
  };
  if (!authToken){
    return <Login setAuthToken={setAuthToken} />;
  }
  return (
    <div style={{ padding:'20px',fontFamily:'sans-serif',maxWidth:'800px',margin:'0 auto' }}>
      <header style={{ display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Repositorio de Musica</h1>
        <button onClick={handleLogout} style={{ backgroundColor:'red',color:'white',padding:'8px 15px',border:'none',cursor:'pointer',borderRadius:'4px' }}>
          Cerrar Sesión
        </button>
      </header>
      <hr />
      <main>
        <Canciones token={authToken} />
      </main>
    </div>
  );
}
export default App;