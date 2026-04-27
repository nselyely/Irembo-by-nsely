# Irembo Citizen Hub - Frontend-Backend Connection Setup

## Overview
This project connects a frontend HTML application with a Node.js/Express backend and MySQL database for Rwanda digital services.

## Prerequisites
- Node.js installed
- MySQL server running
- Password for MySQL root user: `1625630ely`

## Setup Instructions

### 1. Database Setup
1. Open MySQL command line or MySQL Workbench
2. Run the database setup script:
   ```bash
   mysql -u root -p1625630ely < database_setup.sql
   ```
   Or run the batch file:
   ```
   setup_database.bat
   ```

### 2. Start Backend Server
1. Open terminal/command prompt
2. Navigate to project directory:
   ```bash
   cd c:\Users\RUSASA\Desktop\backend\irembo
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   Or run:
   ```
   start.bat
   ```

### 3. Test Connection
1. Open `test_connection.html` in your browser
2. This will verify:
   - Backend server is running on port 5000
   - API endpoints are accessible
   - Authentication is working

### 4. Access Frontend
Open `front_end/index.html` in your browser to use the application.

## Default Users
- **Admin**: username `admin`, password `admin123`
- **User**: username `user`, password `user123`

## API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/services` - Get available services (requires auth)
- `POST /api/service/submit` - Submit service request (requires auth)
- `GET /api/admin/transactions` - Get all transactions (admin only)
- `GET /api/admin/analytics` - Get analytics data (admin only)

## Features
- User authentication with JWT tokens
- Service requests with payment processing
- PDF receipt generation
- Email notifications (simulation)
- Admin dashboard with analytics
- Mobile money payment simulation

## Database Tables
- `users` - User accounts and authentication
- `services` - Available government services
- `transactions` - Payment records and receipts
- `service_requests` - Detailed service request data

## Troubleshooting
1. **Server won't start**: Check MySQL connection in `.env` file
2. **Database errors**: Ensure MySQL is running and password is correct
3. **Connection refused**: Make sure backend server is running on port 5000
4. **CORS errors**: Backend includes CORS middleware for frontend access

## File Structure
```
irembo/
├── server.js              # Backend server
├── package.json            # Node dependencies
├── .env                    # Environment variables
├── database_setup.sql      # Database schema
├── front_end/
│   └── index.html         # Frontend application
├── start.bat              # Server startup script
├── setup_database.bat     # Database setup script
├── test_connection.html   # Connection testing tool
└── README.md              # This file
```

## Environment Variables
- `PORT=5000` - Server port
- `DB_HOST=localhost` - Database host
- `DB_USER=root` - Database user
- `DB_PASSWORD=1625630ely` - Database password
- `DB_NAME=irembo_citizen_hub` - Database name
- `JWT_SECRET=irembo_secret_key_2025` - JWT secret key
