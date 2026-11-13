from django.db import models

class Cancion(models.Model):
    titulo=models.CharField(max_length=200)
    artista=models.CharField(max_length=200)
    genero=models.CharField(max_length=100)
    anio_lanzamiento=models.IntegerField()
    

    fecha_agregado = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return f"{self.titulo} - {self.artista}"