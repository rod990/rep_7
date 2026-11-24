from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

from musica.views import LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', obtain_auth_token),   # POST {username, password} -> {token}
    path('api/logout/', LogoutView.as_view()),  # POST con token -> 204
    path('api/', include('musica.urls')),    # /api/canciones/ (CRUD)
]
