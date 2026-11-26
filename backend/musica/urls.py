from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CancionViewSet, BuscarMusicaView
router = DefaultRouter()
router.register(r'canciones', CancionViewSet)
urlpatterns = [
    path('buscar/', BuscarMusicaView.as_view()),
    path('', include(router.urls)),
]
