import mongoose, { Document, Schema } from 'mongoose';

export interface IRoadmap extends Document {
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'ai' | 'data-science';
  steps: string[];
  resources: {
    name: string;
    url: string;
    type: 'documentation' | 'course' | 'tutorial' | 'book';
  }[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  createdAt: Date;
}

export interface IUserGuidance extends Document {
  userId: mongoose.Types.ObjectId;
  selectedPath: string;
  completedSteps: number[];
  bookmarkedResources: mongoose.Types.ObjectId[];
  lastAccessed: Date;
}

const RoadmapSchema = new Schema<IRoadmap>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['frontend', 'backend', 'fullstack', 'mobile', 'ai', 'data-science'],
    required: true 
  },
  steps: [{ type: String, required: true }],
  resources: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['documentation', 'course', 'tutorial', 'book'], required: true }
  }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  estimatedDuration: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserGuidanceSchema = new Schema<IUserGuidance>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  selectedPath: { type: String, required: true },
  completedSteps: [{ type: Number }],
  bookmarkedResources: [{ type: Schema.Types.ObjectId, ref: 'Roadmap' }],
  lastAccessed: { type: Date, default: Date.now }
});

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
export const UserGuidance = mongoose.model<IUserGuidance>('UserGuidance', UserGuidanceSchema);
