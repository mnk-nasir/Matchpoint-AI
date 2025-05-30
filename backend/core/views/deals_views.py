from rest_framework import generics, permissions
from core.models.deals import Watchlist, PipelineStage, Contact
from core.serializers.deals_serializers import WatchlistSerializer, PipelineStageSerializer, ContactSerializer

class WatchlistListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WatchlistDestroyAPIView(generics.DestroyAPIView):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'startup_id'

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)


class PipelineStageListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = PipelineStageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PipelineStage.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PipelineStageUpdateAPIView(generics.UpdateAPIView):
    serializer_class = PipelineStageSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'startup_id'

    def get_queryset(self):
        return PipelineStage.objects.filter(user=self.request.user)


class ContactListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ContactDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user)
