# MiMusica – Proyecto Final 

Aplicación web para administrar un catálogo de canciones.

## 1. Backend – http://127.0.0.1:8000
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
