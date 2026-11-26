from datetime import date
from rest_framework import serializers
from .models import Cancion
class CancionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cancion
        fields = '__all__'
    def validate_anio_lanzamiento(self, value):
        if value > date.today().year:
            raise serializers.ValidationError(
                "El año de lanzamiento no puede estar en el futuro."
            )
        if value < 1900:
            raise serializers.ValidationError(
                "El año debe ser realista (mayor o igual a 1900)."
            )
        return value
    def validate_titulo(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "El título debe tener al menos 2 caracteres."
            )
        return value
    def validate(self, data):
        titulo = data.get('titulo', getattr(self.instance, 'titulo', '')).strip()
        artista = data.get('artista', getattr(self.instance, 'artista', '')).strip()
        duplicadas = Cancion.objects.filter(titulo__iexact=titulo, artista__iexact=artista)
        if self.instance is not None:
            duplicadas = duplicadas.exclude(pk=self.instance.pk)
        if duplicadas.exists():
            raise serializers.ValidationError("Ya tienes esta canción en tu biblioteca.")
        return data
