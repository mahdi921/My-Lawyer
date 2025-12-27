from django.shortcuts import redirect
from django.conf import settings
from django.urls import reverse

class AuthRedirectMiddleware:
    """
    Server-side redirect rules:
    - Authenticated users visiting /login or /register -> /dashboard
    - Unauthenticated users visiting protected routes -> /login
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.auth_paths = ['/api/auth/login/', '/api/auth/register/', '/login', '/register']
        # Note: Frontend handles client-side routing, but if this middleware runs, 
        # it means a request hit Django. For API requests, we let DRF permissions handle 401.
        # This is primarily for "if we served HTML" or explicit redirects, 
        # but since we are DRF-first, this might be less critical for pure API, 
        # yet the user requested it explicitly.
        #
        # However, purely API-based redirects (302) can break AJAX clients. 
        # We will apply this mainly to 'root' or specific known non-API paths if they existed.
        # But wait, the user instructions say:
        # "If authenticated user attempts to access /login or /register, redirect server-side (HTTP 302)..."
        # "If unauthenticated user attempts to access any /dashboard/* route, redirect to / or /login."
        #
        # Since this is a SPA (React) served via Index.html for all routes, 
        # the Django BACKEND doesn't actually see '/dashboard' requests unless we are serving the SPA
        # via Django views (which we are not, we are using Vite for dev, or nginx for prod).
        #
        # BUT, the user prompt implies we might be serving frontend or want this protection.
        # I will implement it safely to strictly follow instructions, possibly for when we serve index.html.

    def __call__(self, request):
        # Skip if API request (let DRF handle)
        if request.path.startswith('/api/'):
            return self.get_response(request)

        # Logic for Authenticated Users
        if request.user.is_authenticated:
            if request.path in ['/login', '/register', '/login/', '/register/']:
                return redirect('/dashboard')

        # Logic for Unauthenticated Users
        else:
            if request.path.startswith('/dashboard'):
                return redirect('/login')

        response = self.get_response(request)
        return response
