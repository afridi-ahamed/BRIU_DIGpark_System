from rest_framework import serializers
from datetime import timedelta
from django.utils import timezone
from .models import ParkingLot, Booking

class ParkingLotSerializer(serializers.ModelSerializer):
    available_spots = serializers.ReadOnlyField()
    current_occupied = serializers.ReadOnlyField()
    created_by = serializers.ReadOnlyField(source='created_by.username')
    availability_schedule = serializers.SerializerMethodField()
    next_available_time = serializers.SerializerMethodField()

    def get_availability_schedule(self, lot):
        today = timezone.localdate()
        return [
            {'start_time': booking.start_time, 'end_time': booking.end_time}
            for booking in lot.bookings.filter(
                status='active', start_time__date=today, end_time__date=today
            ).order_by('start_time')
        ]

    def get_next_available_time(self, lot):
        if lot.available_spots > 0:
            return None
        now = timezone.now()
        return lot.bookings.filter(
            status='active', start_time__lte=now, end_time__gt=now
        ).order_by('end_time').values_list('end_time', flat=True).first()

    class Meta:
        model = ParkingLot
        fields = [
            'id', 'name', 'lot_type', 'location', 'description',
            'total_capacity', 'current_occupied', 'available_spots',
            'availability_schedule', 'next_available_time',
            'is_active', 'created_by', 'created_at', 'updated_at'
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    university_id = serializers.CharField(write_only=True, required=True, help_text="University ID of the parker")
    start_time = serializers.DateTimeField(write_only=True, required=True)
    end_time = serializers.DateTimeField(write_only=True, required=True)

    class Meta:
        model = Booking
        fields = ['parking_lot', 'start_time', 'end_time', 'vehicle_number', 'university_id']

    def validate(self, attrs):
        end_time = attrs.get('end_time')
        start_time = attrs.get('start_time')
        if end_time <= start_time:
            raise serializers.ValidationError({'end_time': 'End time must be after the booking start time.'})
        if timezone.localtime(start_time).date() != timezone.localtime(end_time).date():
            raise serializers.ValidationError('Bookings must start and end on the same day.')
        if start_time < timezone.now():
            raise serializers.ValidationError({'start_time': 'Choose a start time that has not passed.'})
        if start_time > timezone.now() + timedelta(hours=8):
            raise serializers.ValidationError({'start_time': 'Choose a start time within the next 8 hours.'})
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    parking_lot_name = serializers.ReadOnlyField(source='parking_lot.name')
    university_member_name = serializers.ReadOnlyField(source='university_member.full_name')
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Booking
        fields = [
            'id', 'created_by_username', 'university_member_name', 'parking_lot', 'parking_lot_name',
            'start_time', 'end_time', 'status', 'vehicle_number', 'exit_token', 'created_at'
        ]
        read_only_fields = ['status', 'exit_token']
