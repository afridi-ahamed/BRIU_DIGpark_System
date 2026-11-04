from django.urls import path
from .views import (
    ParkingLotListCreateView,
    ParkingLotDetailView,
    BookingListCreateView,
    BookingDetailView,
    VehicleExitView,
)

urlpatterns = [
    # Parking Lot CRUD
    path('parkings/get-all-lots/', ParkingLotListCreateView.as_view(), name='get-all-lots'),
    path('parkings/create-lot/', ParkingLotListCreateView.as_view(), name='create-lot'),
    path('parking/update-lot/<int:pk>/', ParkingLotDetailView.as_view(), name='update-lot'),
    path('parking/delete-lot/<int:pk>/', ParkingLotDetailView.as_view(), name='delete-lot'),

    # Booking endpoints
    path('parkings/get-all-bookings/', BookingListCreateView.as_view(), name='get-all-bookings'),
    path('parkings/create-booking/', BookingListCreateView.as_view(), name='create-booking'),
    path('parking/update-booking/<int:pk>/', BookingDetailView.as_view(), name='update-booking'),
    path('parking/delete-booking/<int:pk>/', BookingDetailView.as_view(), name='delete-booking'),
    
    # Vehicle Exit
    path('parking/exit-vehicle/', VehicleExitView.as_view(), name='vehicle-exit'),
]