# Staff Credentials Management

## Current System

The staff login system uses environment variables for better security and management.

## How to Set Credentials

### Option 1: Environment Variables (Recommended)

1. Create a `.env` file in your project root:
```bash
VITE_STAFF_USERNAME=your_username
VITE_STAFF_PASSWORD=your_password
```

2. Restart your development server after making changes.

### Option 2: Direct Code Modification

Edit `src/utils/auth.js` and change the default values:
```javascript
const STAFF_CREDENTIALS = {
  username: 'your_username',
  password: 'your_password'
};
```

## Default Credentials

- **Username**: `staff`
- **Password**: `vansun2024`

## Security Best Practices

1. **Use Strong Passwords**: At least 6 characters, include numbers and special characters
2. **Change Regularly**: Update credentials periodically
3. **Don't Share**: Keep credentials private
4. **Environment Variables**: Use `.env` files for production
5. **Backup**: Keep a secure backup of credentials

## Accessing the System

1. Go to: `http://localhost:5173/staff/login`
2. Enter your credentials
3. Access dashboard at: `/staff/dashboard`
4. Manage credentials at: `/staff/credentials`

## Credentials Manager

The built-in credentials manager allows staff to:
- View current user information
- Update username and password
- Validate password strength
- Confirm password changes

## Production Deployment

For production, ensure:
1. Environment variables are properly set
2. `.env` file is not committed to version control
3. Credentials are securely stored
4. Regular security audits

## Troubleshooting

- **Can't Login**: Check credentials in `.env` file
- **Session Expired**: Re-login (sessions last 24 hours)
- **Password Reset**: Use the credentials manager or update `.env` file 