from rest_framework import serializers
from .models import Cancion
from datetime import datetime
class CancionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Cancion
        fields='__all__'
    def validate_año_lanzamiento(self, value):
        año_actual=datetime.now().year
        if value>año_actual:
            raise serializers.ValidationError("El año de lanzamiento no puede estar en el futuro.")
        if value<1900:
            raise serializers.ValidationError("El año debe ser realista (mayor a 1900).")
        return value
    def validate_titulo(self,value):
        if len(value.strip())<2:
            raise serializers.ValidationError("El título debe tener al menos 2 caracteres.")
        return value