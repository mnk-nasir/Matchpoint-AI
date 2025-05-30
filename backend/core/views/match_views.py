from rest_framework import views, permissions
from rest_framework.response import Response
from core.services.match_engine import match_startup_with_investors

class StartupMatchAPIView(views.APIView):
    """
    MatchPoint AI API: Startups -> Investors
    Calls the background engine to algorithmically match a startup with the 
    best fitting Investors based on 5 pillars, returning a sorted JSON array.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, startup_id):
        # The engine handles validating the ID, scoring the math, 
        # saving the row to DB, and returning the structured dicts.
        matches = match_startup_with_investors(startup_id)
        
        if not matches:
            return Response({"error": "Startup not found or no matches computed"}, status=404)
            
        return Response(matches)
