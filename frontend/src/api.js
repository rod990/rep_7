// Unico punto de comunicacion con el backend Django (DRF).
// Todos los componentes llaman a apiFetch(); aqui se centralizan la URL,
// el token y la traduccion de errores HTTP a mensajes para el usuario.

const API_URL = 'http://127.0.0.1:8000/api';

const ETIQUETAS = {
    titulo: 'Título',
    artista: 'Artista',
    genero: 'Género',
    anio_lanzamiento: 'Año',
};

export class ApiError extends Error {
    constructor(status, data) {
        super(`HTTP ${status}`);
        this.status = status; // 0 = no hubo respuesta (backend apagado)
        this.data = data;     // cuerpo JSON del error, si lo hay
    }
}

export async function apiFetch(ruta, { method = 'GET', token, body } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Token ${token}`;

    let res;
    try {
        res = await fetch(`${API_URL}${ruta}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, null);
    }

    if (res.status === 204) return null; // DELETE / logout: sin cuerpo

    let data = null;
    try {
        data = await res.json();
    } catch {
        // la respuesta no era JSON
    }
    if (!res.ok) throw new ApiError(res.status, data);
    return data;
}

// Convierte {titulo: ["..."], anio_lanzamiento: ["..."]} en un texto legible.
function textoValidacion(data) {
    if (!data || typeof data !== 'object') return 'Los datos enviados no son válidos.';
    if (data.detail) return data.detail;
    return Object.entries(data)
        .map(([campo, msgs]) => {
            const texto = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
            return campo === 'non_field_errors' ? texto : `${ETIQUETAS[campo] ?? campo}: ${texto}`;
        })
        .join(' | ');
}

export function mensajeDeError(err) {
    if (!(err instanceof ApiError)) return 'Ocurrió un error inesperado.';
    switch (err.status) {
        case 0:
            return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido (python manage.py runserver).';
        case 400:
            return textoValidacion(err.data);
        case 401:
        case 403:
            return 'Tu sesión no es válida o expiró. Inicia sesión nuevamente.';
        case 404:
            return 'El registro no existe (quizás ya fue eliminado).';
        default:
            return `Error del servidor (${err.status}). Intenta nuevamente.`;
    }
}
