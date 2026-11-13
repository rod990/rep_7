from rest_framework import viewsets
from .models import Cancion
from .serializers import CancionSerializer

class CancionViewSet(viewsets.ModelViewSet):
    queryset=Cancion.objects.all()
    serializer_class=CancionSerializer