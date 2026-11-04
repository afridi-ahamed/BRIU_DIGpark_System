from django.urls import path
from .views import (
    LoginView,
    StaffListCreateView,
    StaffDetailView,
    VerifyUniversityUserView,
    UniversityMemberDirectoryView,
    MemberAccountCreateView,
)

urlpatterns = [
    path('user/login/', LoginView.as_view(), name='login'),

    #Staff Management
    path('users/get-all-staff/', StaffListCreateView.as_view(), name='get-all-staff'),
    path('user/create-staff/', StaffListCreateView.as_view(), name = 'create-staff'),
    path('user/update-staff/<int:pk>/', StaffDetailView.as_view(), name='update-staff'),
    path('user/delete-staff/<int:pk>/', StaffDetailView.as_view(), name='delete-staff'),

    # ID Verification
    path('users/verify/<str:university_id>/', VerifyUniversityUserView.as_view(), name='verify-university-user'),
    path('users/members/', UniversityMemberDirectoryView.as_view(), name='university-member-directory'),
    path('user/create-member-account/', MemberAccountCreateView.as_view(), name='create-member-account'),
]
