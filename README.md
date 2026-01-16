# Leave Management System

Website for managing leave requests, dayoffs with a permission system for employees and managers.

## Fetures

### Employee
- Log in to the system.
- Create leave request (vacation, sick leave, personal reason, unpaid leave)
- View list of their own leave requests.
- **Cannot edit or delete submitted requests** (locked)

### Manager
- Log in to the system
- Create accounts for new employees
- View list of all employees
- Delete employees
- View all leave requests
- Approve or reject leave requests

## Technologies Used

- **Frontend**: React 18, React Router
- **Backend**: Node.js, Express
- **Authentication**: JWT (JSON Web Token)
- **Database**: JSON file (simple, easy to use)

## Installation

### Requirements
- Node.js (version 14 or higher)
- npm or yarn

### Installation Steps

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   Or install separately:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Run the application:**

   Run frontend and backend simultaneously:
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5000

## Default Accounts

- **Manager:**
  - Username: `admin`
  - Password: `admin123`

## Project Structure

```
HTTDD/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.js
│   └── package.json
├── server/                 # Backend Express
│   ├── index.js           # Main server
│   ├── database.json      # Database (auto-created)
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/login` - Login
- `GET /api/me` - Get current user info

### Users (Manager only)
- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới
- `DELETE /api/users/:id` - Xóa user

### Leave Requests
- `GET /api/leave-requests` - Get list of leave requests
- `POST /api/leave-requests` - Create new leave request
- `GET /api/leave-requests/:id` - Get request details
- `PUT /api/leave-requests/:id` - Update request (only when canEdit = true)
- `DELETE /api/leave-requests/:id` - Delete request (only when canEdit = true)
- `PATCH /api/leave-requests/:id/status` - DApprove/reject request (Manager only)

## Note

- Database is stored in `server/database.json` (auto-created on first run)
- Default JWT secret key is 'your-secret-key-change-in-production' - should be changed in production environment
- Leave requests are automatically locked (canEdit = false) after being approved/rejected

## Future Development

Possible features to add:
- More detailed permissions
- Statistics and reports
- Email notifications
- Leave calendar
- Export data to Excel/PDF

