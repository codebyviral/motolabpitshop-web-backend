# MotoLabPitShop API

A robust Express.js backend API for MotoLabPitShop - providing authentication, order management, and admin functionalities.

## 🚀 Features

- **User Authentication**
  - Email/Password authentication
  - Google OAuth 2.0 integration
  - Session management
  
- **Order Management**
  - Create, read, update, and delete orders
  - Order status tracking
  - Notification system

- **Admin Dashboard**
  - User management
  - Order analytics
  - Inventory control

## 📋 Prerequisites

- Node.js (v16.x or higher)
- MongoDB (v4.x or higher)
- Google OAuth credentials

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=8000
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
DEV_FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
MONGODB_URI=mongodb://localhost:27017/motolab
```

## 🛠️ Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/motolabpitshop-api.git
   cd motolabpitshop-api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. For production
   ```bash
   npm start
   ```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/login/success` | Check login status |
| GET | `/logout` | Logout user |

### API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| * | `/api/auth/*` | Authentication routes |
| * | `/api/admin/*` | Admin panel routes |
| * | `/api/order/*` | Order management routes |

## 🏗️ Project Structure

```
motolabpitshop-api/
├── config/
│   └── db.js              # Database connection
├── models/
│   └── user.model.js      # User schema
├── router/
│   ├── admin-router.js    # Admin routes
│   ├── auth-router.js     # Auth routes
│   └── order-router.js    # Order routes
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── app.js                 # Main application file
├── package.json           # Project dependencies
└── README.md              # Documentation
```

## 🔒 Authentication Flow

1. User navigates to `/auth/google`
2. After successful authentication, redirected to frontend
3. Frontend can verify login status with `/login/success`
4. Session maintained until logout or expiration

## 🧰 Technologies Used

- **Express.js** - Web server framework
- **MongoDB** - Database
- **Passport.js** - Authentication middleware
- **express-session** - Session management
- **CORS** - Cross-Origin Resource Sharing

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

Project Maintainer: [Viral Vaghela](mailto:your.email@example.com)
