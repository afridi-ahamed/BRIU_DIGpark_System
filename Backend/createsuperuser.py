import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_parking.settings')
django.setup()

from users.models import CustomUser

if not CustomUser.objects.filter(username='admin2').exists():
    CustomUser.objects.create_superuser('admin2', 'admin2@dps.com', '123')
    print("Superuser 'admin1' created with password '123'")
else:
    print("Superuser 'admin1' already exists")
