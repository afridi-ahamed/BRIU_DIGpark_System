from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
import random
import string

from .models import ParkingLot, Booking
from .serializers import (
    ParkingLotSerializer, 
    BookingSerializer, 
    BookingCreateSerializer
)
from users.models import UniversityMember
from users.permissions import IsSuperAdminOrReadOnly, IsSuperAdmin, IsStaffOrSuperAdmin


def reset_previous_day_bookings():
    today = timezone.localdate()
    Booking.objects.filter(status='active').filter(
        Q(end_time__date__lt=today)
        | Q(end_time__isnull=True, start_time__date__lt=today)
    ).update(status='completed', updated_at=timezone.now())


# ====================== PARKING LOT MANAGEMENT (Superadmin Only) ======================
class ParkingLotListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrReadOnly]

    def get(self, request):
        lots = ParkingLot.objects.all()
        serializer = ParkingLotSerializer(lots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ParkingLotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response({
                "message": "Parking lot created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ParkingLotDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_object(self, pk):
        try:
            return ParkingLot.objects.get(pk=pk)
        except ParkingLot.DoesNotExist:
            return None

    def get(self, request, pk):
        lot = self.get_object(pk)
        if not lot:
            return Response({"error": "Parking lot not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ParkingLotSerializer(lot)
        return Response(serializer.data)

    def put(self, request, pk):
        lot = self.get_object(pk)
        if not lot:
            return Response({"error": "Parking lot not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ParkingLotSerializer(lot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Parking lot updated successfully",
                "data": serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        lot = self.get_object(pk)
        if not lot:
            return Response({"error": "Parking lot not found"}, status=status.HTTP_404_NOT_FOUND)
      
        if lot.bookings.filter(status='active').exists():
            return Response({"error": "Cannot delete lot with active bookings"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        lot.delete()
        return Response({"message": "Parking lot deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# ====================== BOOKING MANAGEMENT ======================
class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reset_previous_day_bookings()
        if request.user.role == 'member':
            if not request.user.university_member_id:
                return Response({"error": "This login is not linked to a university member."}, status=status.HTTP_403_FORBIDDEN)
            bookings = Booking.objects.filter(university_member_id=request.user.university_member_id)
        else:
            bookings = Booking.objects.select_related('parking_lot', 'university_member').all()
        
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request):
        reset_previous_day_bookings()
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        parking_lot = serializer.validated_data['parking_lot']
        vehicle_number = serializer.validated_data.get('vehicle_number', '')
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']
        if request.user.role == 'member':
            if not request.user.university_member_id:
                return Response({"error": "This login is not linked to a university member."}, status=status.HTTP_403_FORBIDDEN)
            member = UniversityMember.objects.select_for_update().get(pk=request.user.university_member_id)
        else:
            university_id = serializer.validated_data.get('university_id')
            try:
                member = UniversityMember.objects.select_for_update().get(university_id=university_id)
            except UniversityMember.DoesNotExist:
                return Response({"error": "University ID not found. User is not registered in the university."},
                                status=status.HTTP_404_NOT_FOUND)

        existing_active = (
            Booking.objects
            .select_related('parking_lot')
            .filter(
                university_member=member, status='active',
                end_time__gt=timezone.now(),
            )
            .order_by('-created_at')
            .first()
        )
        if existing_active:
            return Response({
                "error": "This university member already has an active booking.",
                "active_booking": BookingSerializer(existing_active).data,
            }, status=status.HTTP_409_CONFLICT)

        parking_lot = ParkingLot.objects.select_for_update().get(pk=parking_lot.pk)

        if not parking_lot.is_active:
            return Response({"error": "This parking lot is currently inactive"},
                            status=status.HTTP_400_BAD_REQUEST)

        exit_token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

        booking = Booking(
            created_by=request.user,
            university_member=member,
            parking_lot=parking_lot,
            start_time=start_time,
            end_time=end_time,
            vehicle_number=vehicle_number,
            status='active',
            exit_token=exit_token
        )

        try:
            booking.save()  

            # Send Email
            email_sent = False
            email_error = None
            if member.email and settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD:
                try:
                    html_message = render_to_string(
                        "confirm_booking.html",
                        {
                            "member": member,
                            "booking": booking,
                            "exit_token": exit_token,
                            "sent_at": timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
                        },
                    )
                    text_message = strip_tags(html_message)
                    send_mail(
                        subject="Your Digital Parking Booking Confirmed",
                        message=text_message,
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[member.email],
                        html_message=html_message,
                        fail_silently=not settings.DEBUG,
                    )
                    email_sent = True
                except Exception as e:
                    if settings.DEBUG:
                        email_error = str(e)
            
            return Response({
                "message": "Booking created successfully",
                "booking": BookingSerializer(booking).data,
                "email_sent": email_sent,
                **({"email_error": email_error} if email_error else {}),
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            booking = Booking.objects.select_related('parking_lot').get(pk=pk)
            if booking.created_by != self.request.user and self.request.user.role != 'superadmin':
                return None
            return booking
        except Booking.DoesNotExist:
            return None

    def get(self, request, pk):
        booking = self.get_object(pk)
        if not booking:
            return Response({"error": "Booking not found or access denied"}, 
                          status=status.HTTP_404_NOT_FOUND)
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

    @transaction.atomic
    def put(self, request, pk):
        booking = self.get_object(pk)
        if not booking:
            return Response({"error": "Booking not found or access denied"}, 
                          status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        was_active = booking.status == 'active'

        if new_status:
            if new_status not in ['active', 'completed', 'cancelled']:
                return Response({"error": "Invalid status code."}, status=status.HTTP_400_BAD_REQUEST)
            booking.status = new_status
            booking.save()

   
        serializer = BookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Booking updated successfully",
                "booking": serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def delete(self, request, pk):
        booking = self.get_object(pk)
        if not booking:
            return Response({"error": "Booking not found or access denied"}, 
                          status=status.HTTP_404_NOT_FOUND)

        if booking.status in ['completed', 'cancelled']:
            return Response({"error": "This booking cannot be cancelled anymore"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        was_active = booking.status == 'active'
        booking.status = 'cancelled'
        booking.save()
            
        return Response({
            "message": "Booking cancelled successfully",
            "booking": BookingSerializer(booking).data
        }, status=status.HTTP_200_OK)


# ====================== VEHICLE EXIT ======================
class VehicleExitView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrSuperAdmin]

    @transaction.atomic
    def post(self, request):
        exit_token = request.data.get('exit_token')
        if not exit_token:
            return Response({"error": "Exit token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.select_related('parking_lot').get(exit_token=exit_token)
                
            if booking.status != 'active':
                return Response({"error": f"Cannot exit. Booking is currently {booking.status}"}, status=status.HTTP_400_BAD_REQUEST)
                
            booking.status = 'completed'
            booking.end_time = timezone.now()
            booking.save(update_fields=['status', 'end_time', 'updated_at'])
            
            return Response({
                "message": "Vehicle exited successfully. Space freed.",
                "booking": BookingSerializer(booking).data
            }, status=status.HTTP_200_OK)
            
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
