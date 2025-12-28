from django.shortcuts import redirect
from django.conf import settings
from django.urls import reverse

class AuthRedirectMiddleware:
    """
    Middleware that redirects authenticated users from auth pages to dashboard,
    and unauthenticated users from protected pages to login.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # Define auth pages that authenticated users shouldn't see
        self.auth_pages = ['/login', '/register', '/login/', '/register/']
        # Define base path for dashboard/protected areas
        self.protected_prefixes = ['/dashboard', '/cases', '/analysis', '/settings', '/profile']

    def __call__(self, request):
        path = request.path
        user = request.user

        # 1. If authenticated user requests login/register -> redirect to dashboard
        if user.is_authenticated and path in self.auth_pages:
            return redirect('/dashboard')

        # 2. If unauthenticated user requests protected pages -> redirect to login
        # This acts as a fallback/defense-in-depth to frontend routing
        if not user.is_authenticated:
            for prefix in self.protected_prefixes:
                if path.startswith(prefix):
                    login_url = '/login' # or reverse('login') if defined
                    return redirect(f'{login_url}?next={path}')

        return self.get_response(request)
