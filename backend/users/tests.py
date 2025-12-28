from django.test import TestCase, Client, RequestFactory
from django.contrib.auth import get_user_model
from django.urls import reverse
from virtual_lawyer.middleware import AuthRedirectMiddleware
from django.http import HttpResponse

User = get_user_model()

class AuthRedirectMiddlewareTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            phone_number='09123456789',
            password='testpassword123'
        )
        self.middleware = AuthRedirectMiddleware(lambda r: HttpResponse("OK"))

    def test_authenticated_access_to_login_redirects_to_dashboard(self):
        request = self.factory.get('/login')
        request.user = self.user
        response = self.middleware(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/dashboard')

    def test_authenticated_access_to_register_redirects_to_dashboard(self):
        request = self.factory.get('/register')
        request.user = self.user
        response = self.middleware(request)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/dashboard')

    def test_unauthenticated_access_to_dashboard_redirects_to_login(self):
        from django.contrib.auth.models import AnonymousUser
        request = self.factory.get('/dashboard')
        request.user = AnonymousUser()
        response = self.middleware(request)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith('/login'))
        self.assertIn('next=/dashboard', response.url)

    def test_unauthenticated_access_to_public_page_passes(self):
        from django.contrib.auth.models import AnonymousUser
        request = self.factory.get('/')
        request.user = AnonymousUser()
        response = self.middleware(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"OK")
