# MiMusica – Proyecto Final 

Aplicación web para administrar un catálogo de canciones.

## 1. Backend (Django) – http://127.0.0.1:8000
```bash
cd backend
python -m venv venv
venv\Scripts\activate            
# source venv/bin/activate       
pip install -r requirements.txt
python manage.py migrate
python manage.py crear_usuario   # crea el rod / 123
python manage.py runserver
```

## 2. Frontend  – http://localhost:5173
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```

## 3. Ingresar
Abrir http://localhost:5173 e iniciar sesión con:
- **Usuario:** `rod`
- **Contraseña:** `123`

## API REST
| Método | URL | Descripción | Respuesta |
|---|---|---|---|
| POST | `/api/login/` | Usuario y contraseña → token | 200 / 400 |
| POST | `/api/logout/` | Cierra sesión (borra el token) | 204 |
| GET | `/api/canciones/` | Lista | 200 |
| GET | `/api/canciones/<id>/` | Detalle | 200 / 404 |
| POST | `/api/canciones/` | Crea | 201 / 400 |
| PUT | `/api/canciones/<id>/` | Actualiza | 200 / 400 / 404 |
| DELETE | `/api/canciones/<id>/` | Elimina | 204 / 404 |

Los endpoints de canciones requieren el header `Authorization: Token <token>`; sin él responden **401**.

## Notas
- CORS (`django-cors-headers`) permite únicamente el origen del frontend (`localhost:5173` y `127.0.0.1:5173`).
- La base de datos es `backend/db.sqlite3` y se genera con `migrate` (no se sube a Git).
- Validaciones del backend: título de al menos 2 caracteres y año entre 1900 y el año actual.
