from rest_framework import serializers
from .models import CustomUser, UniversityMember

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'full_name', 'phone', 'email', 'role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'full_name', 'phone', 'email', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'staff')
        password = validated_data.pop('password')
        
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.role = role
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UniversityMemberDirectorySerializer(serializers.ModelSerializer):
    has_account = serializers.SerializerMethodField()

    class Meta:
        model = UniversityMember
        fields = ['id', 'university_id', 'full_name', 'email', 'category', 'has_account']

    def get_has_account(self, member):
        return hasattr(member, 'account')


class MemberAccountCreateSerializer(serializers.Serializer):
    university_id = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_university_id(self, value):
        try:
            member = UniversityMember.objects.get(university_id=value)
        except UniversityMember.DoesNotExist:
            raise serializers.ValidationError('No university member has this ID.')
        if hasattr(member, 'account'):
            raise serializers.ValidationError('This member already has a login account.')
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('A login already uses this university ID.')
        return value

    def create(self, validated_data):
        member = UniversityMember.objects.get(university_id=validated_data['university_id'])
        return CustomUser.objects.create_user(
            username=member.university_id,
            password=validated_data['password'],
            full_name=member.full_name,
            email=member.email,
            role='member',
            university_member=member,
        )

class UniversityMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityMember
        fields = '__all__'
