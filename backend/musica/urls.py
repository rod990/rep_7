from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CancionViewSet
router=DefaultRouter()
router.register(r'canciones',CancionViewSet)
urlpatterns=[
    path('',include(router.urls)),]