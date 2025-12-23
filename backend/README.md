# Student Welfare Backend

Backend API for the College Student Welfare Application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication (JWT)
- Domain selection quiz
- Study planner with progress tracking
- Mock interview scheduling and feedback
- Progress monitoring and analytics
- RESTful API design

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-welfare-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Quiz

- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results` - Get user's quiz results

### Study Planner

- `GET /api/planner/plan` - Get study plan
- `POST /api/planner/plan` - Create/update study plan
- `PUT /api/planner/topics/:topicId` - Update topic status
- `POST /api/planner/schedule` - Set study schedule
- `GET /api/planner/upcoming-sessions` - Get upcoming study sessions

### Interviews

- `GET /api/interviews` - Get user's interviews
- `POST /api/interviews` - Schedule an interview
- `GET /api/interviews/:id` - Get interview details
- `PUT /api/interviews/:id/cancel` - Cancel an interview
- `PUT /api/interviews/:id/feedback` - Add interview feedback (admin only)

### Progress Tracking

- `GET /api/progress/overview` - Get progress overview
- `GET /api/progress/:category` - Get progress by category (study, quizzes, interviews)
- `GET /api/progress/timeline` - Get progress timeline

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `JWT_EXPIRE` - JWT expiration time
- `CORS_ORIGIN` - Allowed CORS origins

## Development

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## License

MIT
