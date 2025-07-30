# Admin User Management System

## Overview

The admin system allows you to create, manage, and remove staff users. It's completely separate from the regular staff login system.

## Access Points

### Admin Login
- **URL**: `http://localhost:5173/admin/login`
- **Default Credentials**: 
  - Username: `admin`
  - Password: `admin2024`

### Staff Login
- **URL**: `http://localhost:5173/staff/login`
- **Credentials**: Created by admin (see below)

## Admin Features

### 1. Admin Dashboard (`/admin/dashboard`)
- View total users count
- See active/inactive users
- Quick access to user management
- Recent users list

### 2. Create Users (`/admin/users/create`)
- Add new staff members
- Set username, password, full name, email
- Choose role (staff, manager, supervisor)
- Password validation (min 6 characters)

### 3. User Management
- View all created users
- Edit user details
- Activate/deactivate users
- Delete users

## How to Use

### Step 1: Access Admin Panel
1. Go to `/admin/login`
2. Login with admin credentials
3. You'll be redirected to admin dashboard

### Step 2: Create Staff Users
1. Click "Create User" on dashboard
2. Fill in user details:
   - **Username**: Must be unique
   - **Password**: Minimum 6 characters
   - **Full Name**: Optional but recommended
   - **Email**: Optional
   - **Role**: Choose from dropdown
3. Click "Create User"

### Step 3: Staff Login
1. New users can login at `/staff/login`
2. Use the credentials you created
3. Access staff dashboard and features

## Security Features

- **Separate Admin/Staff Systems**: Admin and staff use different authentication
- **Password Validation**: Minimum 6 characters required
- **Unique Usernames**: No duplicate usernames allowed
- **Session Management**: 24-hour sessions for both admin and staff
- **Protected Routes**: Unauthorized access redirected to login

## Environment Variables

You can set admin credentials via environment variables:

```bash
# .env file
VITE_ADMIN_USERNAME=your_admin_username
VITE_ADMIN_PASSWORD=your_admin_password
```

## Data Storage

- **Admin Users**: Stored in localStorage
- **Staff Users**: Stored in localStorage
- **Sessions**: Managed via localStorage with expiry

## Default Credentials

### Admin
- Username: `admin`
- Password: `admin2024`

### Staff (After Creation)
- Username: As created by admin
- Password: As set by admin

## Troubleshooting

- **Can't Login as Admin**: Check admin credentials in `.env` or use defaults
- **Can't Create Users**: Ensure username is unique and password is 6+ characters
- **Staff Can't Login**: Verify user is active and credentials are correct
- **Session Expired**: Re-login (sessions last 24 hours)

## Next Steps

1. **Test the System**: Create a few test users
2. **Customize Credentials**: Update admin credentials in `.env`
3. **Add More Features**: User editing, bulk operations, etc.
4. **Database Integration**: Move from localStorage to proper database 