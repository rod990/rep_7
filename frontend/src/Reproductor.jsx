import { useEffect, useRef, useState } from 'react';

const FUENTE = '"Times New Roman", Times, serif';

const formatoTiempo = (seg) => {
    if (!Number.isFinite(seg) || seg < 0) return '0:00';
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

// Reproductor fijo abajo. Recibe la pista actual y la lista de canciones reproducibles
// (las que tienen preview_url) para poder pasar a la anterior / siguiente.
export default function Reproductor({ pista, lista, onCambiarPista, onCerrar }) {
    const audioRef = useRef(null);
    const [sonando, setSonando] = useState(false);
    const [tiempo, setTiempo] = useState(0);
    const [duracion, setDuracion] = useState(0);
    const [error, setError] = useState('');

    const idx = lista.findIndex((c) => c.preview_url === pista.preview_url);
    const anterior = idx > 0 ? lista[idx - 1] : null;
    const siguiente = idx >= 0 && idx < lista.length - 1 ? lista[idx + 1] : null;

    // Cada vez que cambia la pista: cargar el audio y reproducirlo.
    // El navegador puede bloquear el autoplay; en ese caso el usuario presiona ▶.
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
        <div
            className="fixed-bottom border-top border-danger px-3 py-2"
            style={{ backgroundColor: '#050505', color: '#fff', fontFamily: FUENTE }}
        >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
                ref={audioRef}
                preload="auto"
                onPlay={() => setSonando(true)}
                onPause={() => setSonando(false)}
                onTimeUpdate={(e) => setTiempo(e.target.currentTime)}
                onLoadedMetadata={(e) => setDuracion(e.target.duration)}
                onEnded={() => (siguiente ? onCambiarPista(siguiente) : setSonando(false))}
                onError={() => setError('No se pudo cargar este audio. Puede que el enlace haya expirado.')}
            />

            <div className="container d-flex flex-wrap align-items-center gap-3" style={{ maxWidth: '1100px' }}>
                <div className="flex-grow-1" style={{ minWidth: '160px' }}>
                    <div className="fw-bold text-truncate">{pista.titulo}</div>
                    <div className="small opacity-75 text-truncate">
                        {pista.artista} · fragmento de 30 s
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-outline-light"
                        disabled={!anterior}
                        onClick={() => onCambiarPista(anterior)}
                        aria-label="Canción anterior"
                    >
                        ⏮
                    </button>
                    <button
                        className="btn btn-sm btn-danger px-3"
                        onClick={alternar}
                        aria-label={sonando ? 'Pausar' : 'Reproducir'}
                    >
                        {sonando ? '⏸' : '▶'}
                    </button>
                    <button
                        className="btn btn-sm btn-outline-light"
                        disabled={!siguiente}
                        onClick={() => onCambiarPista(siguiente)}
                        aria-label="Canción siguiente"
                    >
                        ⏭
                    </button>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={onCerrar}
                        aria-label="Cerrar reproductor"
                    >
                        ✕
                    </button>
                </div>

                <div className="d-flex align-items-center gap-2 w-100">
                    <span className="small" style={{ minWidth: '38px' }}>{formatoTiempo(tiempo)}</span>
                    <input
                        type="range"
                        className="form-range flex-grow-1"
                        min={0}
                        max={Number.isFinite(duracion) ? duracion : 0}
                        step={0.1}
                        value={tiempo}
                        onChange={moverA}
                        aria-label="Progreso de la canción"
                    />
                    <span className="small" style={{ minWidth: '38px' }}>{formatoTiempo(duracion)}</span>
                </div>

                {error && <div className="small text-danger w-100">{error}</div>}
            </div>
        </div>
    );
}
