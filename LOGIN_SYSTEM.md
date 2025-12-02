# Login System Documentation

## Overview

The Smart Urban Development system includes a simple admin-only login system to secure access to the dashboard.

## Login Credentials

**Default Admin Account:**
- **Username:** `admin`
- **Password:** `admin123`

## How It Works

### Authentication Flow

1. **Homepage (index.html)**
   - User lands on the login page
   - Enters username and password
   - System validates credentials
   - On success: Redirects to dashboard
   - On failure: Shows error message

2. **Dashboard (dashboard.html)**
   - Checks for valid session
   - If not logged in: Redirects to login page
   - If logged in: Shows dashboard

3. **Logout**
   - Clears session storage
   - Redirects to login page

### Session Management

- Uses `sessionStorage` for client-side session management
- Session persists until:
  - User clicks logout
  - Browser tab is closed
  - Session is manually cleared

### Security Notes

**For Production:**
- Implement server-side authentication
- Use secure password hashing (bcrypt)
- Implement session tokens
- Add CSRF protection
- Use HTTPS
- Implement password reset functionality
- Add account lockout after failed attempts
- Store credentials in database, not JavaScript

**Current Implementation:**
- Simple client-side authentication (for demo/development)
- Credentials stored in JavaScript (not secure for production)
- Suitable for local development and testing

## Files Involved

- `index.html` - Login page
- `dashboard.html` - Main dashboard (protected)
- `assets/js/app.js` - Contains logout function and session check

## Customization

### Change Login Credentials

Edit `index.html`:
```javascript
const ADMIN_CREDENTIALS = {
    username: 'your_username',
    password: 'your_password'
};
```

### Add More Users

For production, implement:
1. User database table
2. Server-side authentication API
3. Session management on server
4. Role-based access control

## Troubleshooting

### Can't Login
- Check username and password (case-sensitive)
- Clear browser cache
- Check browser console for errors
- Verify JavaScript is enabled

### Redirect Loop
- Clear sessionStorage: `sessionStorage.clear()`
- Clear browser cache
- Check for JavaScript errors

### Session Not Persisting
- Ensure cookies are enabled
- Check browser privacy settings
- Try different browser

---

**Note:** This is a simple authentication system for development. For production use, implement proper server-side authentication.

