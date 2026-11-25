from django.db import models

class Cancion(models.Model):
    titulo=models.CharField(max_length=200)
    artista=models.CharField(max_length=200)
    genero=models.CharField(max_length=100)
    anio_lanzamiento=models.IntegerField()
    # URL del fragmento de audio (Deezer, 30 s) y de la portada. Vacías si la canción se creó a mano.
    preview_url = models.URLField(max_length=500, blank=True, default='')
    portada = models.URLField(max_length=500, blank=True, default='')

    fecha_agregado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.artista}"
