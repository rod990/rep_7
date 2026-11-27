import { useEffect, useRef, useState } from 'react';
const formatoTiempo = (seg) => {
    if (!Number.isFinite(seg) || seg < 0) return '0:00';
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};
export default function Reproductor({ pista, lista, onCambiarPista, onCerrar }) {
    const audioRef = useRef(null);
    const [sonando, setSonando] = useState(false);
    const [tiempo, setTiempo] = useState(0);
    const [duracion, setDuracion] = useState(0);
    const [error, setError] = useState('');
    const idx = lista.findIndex((c) => c.preview_url === pista.preview_url);
    const anterior = idx > 0 ? lista[idx - 1] : null;
    const siguiente = idx >= 0 && idx < lista.length - 1 ? lista[idx + 1] : null;
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        setError('');
        setTiempo(0);
        audio.src = pista.preview_url;
        audio.play().catch(() => setSonando(false));
    }, [pista.preview_url]);
    const alternar = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            audio.play().catch(() => setError('No se pudo reproducir este audio.'));
        } else {
            audio.pause();
        }
    };
    const moverA = (e) => {
        const audio = audioRef.current;
        if (audio) audio.currentTime = Number(e.target.value);
    };
    return (
        <div className="reproductor">
            <audio
                ref={audioRef}
                preload="auto"
                onPlay={() => setSonando(true)}
                onPause={() => setSonando(false)}
                onTimeUpdate={(e) => setTiempo(e.target.currentTime)}
                onLoadedMetadata={(e) => setDuracion(e.target.duration)}
                onEnded={() => (siguiente ? onCambiarPista(siguiente) : setSonando(false))}
                onError={() => setError('No se pudo cargar este audio. El enlace puede haber expirado.')}
            />
            <div className="reproductor-inner">
                <div className="reproductor-info">
                    {pista.portada && <img className="portada" src={pista.portada} alt="" />}
                    <div className="texto-pista">
                        <div className="titulo-cancion">{pista.titulo}</div>
                        <div className="sub">{pista.artista} · fragmento de 30 s</div>
                    </div>
                </div>
                <div className="controles">
                    <button className="btn-icono" disabled={!anterior} onClick={() => onCambiarPista(anterior)} aria-label="Anterior">⏮</button>
                    <button className="btn-icono btn-principal" onClick={alternar} aria-label={sonando ? 'Pausar' : 'Reproducir'}>
                        {sonando ? '❚❚' : '▶'}
                    </button>
                    <button className="btn-icono" disabled={!siguiente} onClick={() => onCambiarPista(siguiente)} aria-label="Siguiente">⏭</button>
                    <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar reproductor">✕</button>
                </div>
                <div className="progreso">
                    <span>{formatoTiempo(tiempo)}</span>
                    <input
                        type="range"
                        min={0}
                        max={Number.isFinite(duracion) ? duracion : 0}
                        step={0.1}
                        value={tiempo}
                        onChange={moverA}
                        aria-label="Progreso"
                    />
                    <span>{formatoTiempo(duracion)}</span>
                </div>
                {error && <div className="aviso-error" style={{ width: '100%', margin: 0 }}>{error}</div>}
            </div>
        </div>
    );
}
