from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CancionViewSet, BuscarMusicaView

router = DefaultRouter()
router.register(r'canciones', CancionViewSet)

urlpatterns = [
    path('buscar/', BuscarMusicaView.as_view()),  # GET /api/buscar/?q=...
    path('', include(router.urls)),
]
