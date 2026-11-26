import json
import urllib.parse
import urllib.request

from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cancion
from .serializers import CancionSerializer

DEEZER_API = 'https://api.deezer.com'
TIMEOUT_SEG = 8
POR_PAGINA = 10


def _deezer(ruta, params=None):
    """Llama a la API de Deezer desde el servidor y devuelve el JSON."""
    url = f"{DEEZER_API}{ruta}"
    if params:
        url += '?' + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=TIMEOUT_SEG) as resp:
        data = json.load(resp)
    # Deezer responde 200 con {"error": {...}} cuando algo falla (p. ej. cuota excedida).
    if 'error' in data:
        raise ValueError(data['error'])
    return data


class CancionViewSet(viewsets.ModelViewSet):
    """CRUD de canciones.

    GET    /api/canciones/        lista      -> 200
    GET    /api/canciones/<id>/   detalle    -> 200 | 404
    POST   /api/canciones/        crea       -> 201 | 400
    PUT    /api/canciones/<id>/   actualiza  -> 200 | 400 | 404
    DELETE /api/canciones/<id>/   elimina    -> 204 | 404
    Sin token valido -> 401 (permiso global IsAuthenticated en settings.py).
    """
    queryset = Cancion.objects.all().order_by('-fecha_agregado')
    serializer_class = CancionSerializer


class BuscarMusicaView(APIView):
    """GET /api/buscar/?q=texto&index=0 -> una página de canciones de Deezer.

    Respuesta: {"resultados": [...], "siguiente": n, "hay_mas": bool}
    - "siguiente" es el valor de index para pedir la página siguiente.
    - Se omiten las canciones sin año de lanzamiento (campo obligatorio en la base).
    Errores: 400 si la búsqueda es muy corta, 502 si Deezer no responde.
    """

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if len(q) < 2:
            return Response(
                {'detail': 'Escribe al menos 2 caracteres para buscar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            index = max(0, int(request.query_params.get('index', 0)))
        except ValueError:
            index = 0

        try:
            data = _deezer('/search', {'q': q, 'limit': POR_PAGINA, 'index': index})
        except (OSError, ValueError):
            return Response(
                {'detail': 'No se pudo consultar Deezer. Intenta nuevamente.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        tracks = data.get('data', [])
        resultados = []
        for t in tracks:
            anio, genero = self._datos_album(t['album']['id'])
            if anio is None:
                continue
            resultados.append({
                'titulo': t['title'],
                'artista': t['artist']['name'],
                'genero': genero,
                'anio_lanzamiento': anio,
                'preview_url': t.get('preview', ''),
                'portada': t['album'].get('cover_medium', ''),
            })

        return Response({
            'resultados': resultados,
            'siguiente': index + len(tracks),
            'hay_mas': 'next' in data,
        })

    @staticmethod
    def _datos_album(album_id):
        """Devuelve (año, género) del álbum. Año None si no se pudo obtener."""
        try:
            album = _deezer(f'/album/{album_id}')
            anio = int(album['release_date'][:4])
        except (OSError, ValueError, KeyError, TypeError):
            return None, 'General'
        generos = album.get('genres', {}).get('data', [])
        genero = generos[0]['name'] if generos else 'General'
        return anio, genero


class LogoutView(APIView):
    """Cierra sesion: borra el token del usuario autenticado."""

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
