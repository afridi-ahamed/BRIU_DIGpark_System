from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


from users.models import CustomUser, UniversityMember


class ParkingLot(models.Model):
    LOT_TYPE_CHOICES = [
        ('general', 'General'),
        ('faculty', 'Faculty Only'),
        ('vip', 'VIP'),
        ('disabled', 'Disabled'),
        ('ev', 'EV Charging'),
    ]

    name = models.CharField(max_length=100, unique=True, help_text="e.g., ABC_Slot, North_Block_A")
    lot_type = models.CharField(max_length=20, choices=LOT_TYPE_CHOICES, default='general')
    location = models.CharField(max_length=150, help_text="e.g., Behind Academic Building")
    description = models.TextField(blank=True)
    
    total_capacity = models.PositiveIntegerField(default=0, help_text="Total number of vehicles this lot can hold (e.g., 40)")
    @property
    def current_occupied(self):
        now = timezone.now()
        return self.bookings.filter(status='active', start_time__lte=now, end_time__gt=now).count()
    
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_lots')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.total_capacity} spots) - {self.get_lot_type_display()}"

    class Meta:
        ordering = ['name']
        verbose_name = "Parking Lot"
        verbose_name_plural = "Parking Lots"

    @property
    def available_spots(self):
        return max(0, self.total_capacity - self.current_occupied)

    def clean(self):
        if self.total_capacity < 0:
            raise ValidationError("Total capacity cannot be negative")


class Booking(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_bookings', help_text="Staff who authorized this")
    university_member = models.ForeignKey(UniversityMember, on_delete=models.CASCADE, related_name='bookings')
    exit_token = models.CharField(max_length=10, unique=True)
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='bookings')
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    vehicle_number = models.CharField(max_length=20, blank=True, help_text="Optional: License plate")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']

    def clean(self):
        if self.status == 'completed':
            if not self.end_time:
                raise ValidationError("End time is required when a booking is completed.")
            if self.start_time and self.end_time < self.start_time:
                raise ValidationError("End time cannot be before start time.")

        if self.status == 'active':
            if not self.parking_lot.is_active:
                raise ValidationError("This parking lot is currently inactive.")
            if not self.start_time or not self.end_time or self.end_time <= self.start_time:
                raise ValidationError("A valid start and end time are required.")
            local_start = timezone.localtime(self.start_time)
            local_end = timezone.localtime(self.end_time)
            if local_start.date() != local_end.date():
                raise ValidationError("Bookings must start and end on the same day.")
            overlaps = Booking.objects.filter(
                parking_lot=self.parking_lot,
                status='active',
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
            ).exclude(pk=self.pk)
            events = [(self.start_time, 1), (self.end_time, -1)]
            for booking in overlaps:
                events.extend(((max(booking.start_time, self.start_time), 1),
                               (min(booking.end_time, self.end_time), -1)))
            occupied = 0
            for _, change in sorted(events, key=lambda event: (event[0], event[1])):
                occupied += change
                if occupied > self.parking_lot.total_capacity:
                    raise ValidationError(f"No space available in {self.parking_lot.name} for this time.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.university_member.full_name} - {self.parking_lot.name} ({self.start_time.date()})"
