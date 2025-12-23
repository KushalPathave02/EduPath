import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  overallProgress: number; // 0-100
  skills: {
    name: string;
    progress: number; // 0-100
    category: string;
  }[];
  streak: {
    current: number;
    longest: number;
    lastActiveDate: Date;
  };
  tasksCompleted: number;
  totalTasks: number;
  weeklyActivity: {
    date: Date;
    hours: number;
    activities: string[];
  }[];
  achievements: mongoose.Types.ObjectId[];
  goals: {
    title: string;
    description: string;
    progress: number;
    targetDate: Date;
    status: 'active' | 'completed' | 'paused';
  }[];
  lastUpdated: Date;
}

export interface IAchievement extends Document {
  title: string;
  description: string;
  icon: string;
  category: string;
  requirements: {
    type: 'streak' | 'tasks' | 'quiz' | 'projects';
    value: number;
  };
  points: number;
  createdAt: Date;
}

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  earnedAt: Date;
  progress: number;
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  overallProgress: { type: Number, min: 0, max: 100, default: 0 },
  skills: [{
    name: { type: String, required: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    category: { type: String, required: true }
  }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now }
  },
  tasksCompleted: { type: Number, default: 0 },
  totalTasks: { type: Number, default: 0 },
  weeklyActivity: [{
    date: { type: Date, required: true },
    hours: { type: Number, required: true },
    activities: [{ type: String }]
  }],
  achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
  goals: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    targetDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const AchievementSchema = new Schema<IAchievement>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, required: true },
  requirements: {
    type: { type: String, enum: ['streak', 'tasks', 'quiz', 'projects'], required: true },
    value: { type: Number, required: true }
  },
  points: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserAchievementSchema = new Schema<IUserAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  earnedAt: { type: Date, default: Date.now },
  progress: { type: Number, min: 0, max: 100, default: 100 }
});

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
