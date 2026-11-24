from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cancion
from .serializers import CancionSerializer


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


class LogoutView(APIView):
    """Cierra sesion: borra el token del usuario autenticado."""

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
