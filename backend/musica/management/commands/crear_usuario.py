from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Crea (o actualiza) el usuario de prueba: rod / 123"

    def handle(self, *args, **options):
        user, creado = User.objects.get_or_create(username="rod")
        user.set_password("123")  # se guarda con hash (pbkdf2), nunca en texto plano
        user.save()
        self.stdout.write(
            self.style.SUCCESS("Usuario 'rod' creado." if creado else "Usuario 'rod' actualizado.")
        )
