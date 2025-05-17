# Contact Management System

A modern, AI-powered contact management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🌟 Key Features

### 1. Smart Contact Management
- **CSV Upload**: Bulk import contacts via CSV files
- **Contact Validation**: Automatic validation of phone numbers and email formats
- **Contact Organization**: Categorize contacts by status (active, inactive, pending)
- **Search & Filter**: Advanced search and filtering capabilities
- **Contact Notes**: Add and manage notes for each contact

### 2. AI-Powered Insights
- **Pattern Analysis**: Identify trends in email domains and contact distribution
- **Engagement Analytics**: Track contact engagement rates and status
- **Geographic Analysis**: Understand your contact base distribution
- **Smart Recommendations**: Get AI-driven suggestions for contact management
- **Real-time Analytics**: Monitor contact activity and engagement

### 3. User Management
- **Secure Authentication**: JWT-based authentication system
- **User Profiles**: Manage user information and preferences
- **Role-based Access**: Different access levels for different user types
- **Session Management**: Secure session handling and token management

### 4. Dashboard & Analytics
- **Real-time Statistics**: View key metrics and statistics
- **Activity Tracking**: Monitor recent uploads and changes
- **Status Overview**: Quick view of contact status distribution
- **Interactive Charts**: Visual representation of contact data
- **Custom Reports**: Generate and export custom reports

### 5. Modern UI/UX
- **Responsive Design**: Works seamlessly on all devices
- **Intuitive Interface**: User-friendly navigation and controls
- **Dark/Light Mode**: Choose your preferred theme
- **Loading States**: Smooth loading transitions
- **Error Handling**: Clear error messages and recovery options

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd contact-management-system
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5001
```

5. Start the development servers:

Server:
```bash
cd server
npm run dev
```

Client:
```bash
cd client
npm run dev
```

## 🛠️ Technology Stack

### Frontend
- React.js
- Axios for API calls
- Context API for state management
- CSS3 with modern features
- Responsive design principles

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- CSV parsing and validation

### Development Tools
- Git for version control
- npm for package management
- ESLint for code quality
- Prettier for code formatting

## 📦 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku account
2. Install Heroku CLI
3. Login to Heroku:
```bash
heroku login
```
4. Create a new Heroku app:
```bash
heroku create your-app-name
```
5. Add MongoDB add-on:
```bash
heroku addons:create mongolab
```
6. Deploy:
```bash
git push heroku main
```

### Frontend Deployment (Vercel)
1. Create a Vercel account
2. Install Vercel CLI:
```bash
npm i -g vercel
```
3. Deploy:
```bash
cd client
vercel
```

## 🔒 Security Features
- JWT-based authentication
- Password hashing
- CORS protection
- Input validation
- Rate limiting
- Secure file uploads

## 📈 Performance Optimizations
- Lazy loading of components
- Optimized database queries
- Caching strategies
- Efficient file handling
- Responsive image loading

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors
- Gaurav Jaiswal - Intial Work

## 🙏 Acknowledgments
- Thanks to all contributors
- Inspired by modern contact management systems
- Built with best practices in mind 