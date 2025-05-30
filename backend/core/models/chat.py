from django.db import models
from django.conf import settings


class ChatSession(models.Model):
    investor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_sessions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"ChatSession<{self.id}> investor={self.investor_id}"


class ChatMessage(models.Model):
    class Sender(models.TextChoices):
        USER = "user"
        ASSISTANT = "assistant"

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=16, choices=Sender.choices)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        return f"ChatMessage<{self.id}> {self.sender}"

