# EduPath

EduPath is a comprehensive educational platform designed to help students and learners with their career journey through AI-powered quizzes, mock interviews, career guidance, and progress tracking.

## Features

- **User Authentication** - Secure JWT-based login/signup
- **AI-Powered Quizzes** - Dynamic quiz generation using Groq AI based on user performance
- **Mock Interviews** - AI-driven technical, HR, and coding interviews with real-time feedback
- **Career Guidance** - Personalized roadmaps for various career paths (Frontend, Backend, Full Stack, Data Science, etc.)
- **Study Planner** - Customized study plans with progress tracking
- **Progress Analytics** - Track learning progress across quizzes, interviews, and study sessions
- **Cross-Platform Mobile App** - Built with React Native and Expo for iOS and Android

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API framework
- **TypeScript** - Type-safe development
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **Groq AI** - AI quiz generation and interview responses
- **Zod** - Input validation

### Frontend
- **React Native** - Mobile framework
- **Expo** - Development and build tools
- **TypeScript** - Type-safe development
- **React Navigation** - Screen navigation
- **Axios** - API communication
- **AsyncStorage** - Local token storage
- **Expo Speech/Audio** - Voice features for interviews

## Project Structure

```
EduPath/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route handlers (auth, quiz, interview, etc.)
│   │   ├── middlewares/  # Auth middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── schemas/      # Validation schemas
│   │   └── server.ts     # Entry point
│   ├── .env              # Environment variables
│   └── package.json
├── frontend/             # React Native Expo app
│   ├── src/
│   │   ├── api/          # API service
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context
│   │   ├── navigation/   # Screen navigators
│   │   └── screens/      # App screens (Login, Home, Profile, Quiz, Interview, etc.)
│   ├── assets/           # Icons and images
│   ├── app.json          # Expo config
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Groq API key (for AI features)
- Expo CLI and EAS CLI (for mobile builds)

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd EduPath

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `.env` file in `/backend`:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/edupath
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:19006
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:5001`

### 4. Start Frontend (Expo)

```bash
cd frontend
npx expo start
```

Press `w` for web, `i` for iOS simulator, `a` for Android emulator.

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Quiz
- `POST /api/quiz/start` - Start AI-generated quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results` - Get quiz history

### Interviews
- `POST /api/interview/chat` - AI mock interview chat
- `GET /api/interview/history` - Get interview history

### Progress
- `GET /api/progress/overview` - Get overall progress
- `GET /api/progress/timeline` - Get progress timeline

### Guidance
- `GET /api/guidance/roadmaps` - Get career roadmaps
- `GET /api/guidance/roadmap/:id` - Get specific roadmap details

### Study Planner
- `GET /api/planner/plan` - Get study plan
- `POST /api/planner/plan` - Create study plan
- `PUT /api/planner/topics/:id` - Update topic status

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | No (default: 5001) |
| `NODE_ENV` | Environment mode | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | Token expiration | No (default: 30d) |
| `CORS_ORIGIN` | Allowed frontend origin | No |
| `GROQ_API_KEY` | Groq AI API key | Yes |

## Deployment

### Backend (Render.com)

1. Push code to GitHub
2. Connect repository to Render
3. Add environment variables in Render dashboard
4. Deploy automatically on git push

Live URL: `https://edupath-backend-e2vb.onrender.com`

### Frontend APK Build (EAS)

```bash
cd frontend

# Login to Expo
eas login

# Configure EAS project
eas build:configure

# Build APK for Android
eas build -p android --profile preview

# Build for iOS (requires Apple Developer account)
eas build -p ios
```

Build profiles are defined in `eas.json`:
- `development` - Development client
- `preview` - APK for testing
- `production` - Production release (AAB for Play Store)

## Available Scripts

### Backend
```bash
npm run dev      # Development with hot-reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run format   # Format with Prettier
```

### Frontend
```bash
npx expo start           # Start Expo development server
npx expo start --web     # Run in browser
npx expo run:android     # Run on Android emulator
npx expo run:ios         # Run on iOS simulator
eas build                # Build with EAS
```

## Configuration Files

- `backend/.env` - Backend environment variables
- `frontend/app.json` - Expo app configuration (name, icons, splash)
- `frontend/eas.json` - EAS build configuration
- `render.yaml` - Render deployment settings

## Screenshots

*Add your app screenshots here*

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own learning or commercial purposes.

## Support

For issues or questions, please open a GitHub issue or contact the project maintainer.

---

**Note:** This project uses Groq AI for quiz generation and interview responses. Make sure to keep your API keys secure and never commit them to version control.
