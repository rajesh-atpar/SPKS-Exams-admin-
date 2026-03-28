# Test Credentials for Mock Authentication

The application now uses mock authentication for development. You can use these credentials to test:

## Login Credentials

### Admin User
- **Email:** admin@example.com
- **Password:** admin123

### Regular User  
- **Email:** user@example.com
- **Password:** password

## Registration

You can also register new users using the registration form with any email and password.

## How to Test

1. Open the application in your browser
2. Go to the login page
3. Use any of the credentials above
4. After successful login, you should be redirected to the admin dashboard

## Troubleshooting

If login doesn't work:
1. Check browser console for errors
2. Make sure the development server is running
3. Verify the `.env.local` file contains `NEXT_PUBLIC_USE_MOCK_AUTH=true`
