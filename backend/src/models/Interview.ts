import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewQuestion extends Document {
  question: string;
  answer: string;
  tips: string;
  category: 'hr' | 'technical' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: Date;
}

export interface ICodingChallenge extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  approach: string;
  solution?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  tags: string[];
  createdAt: Date;
}

export interface IFeedback {
  technicalSkills?: number;
  problemSolving?: number;
  communication?: number;
  strengths?: string;
  areasForImprovement?: string;
  overallScore?: number;
}

export interface IMockInterview extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  interviewer?: string;
  date: Date;
  duration: number;
  notes?: string;
  questions: mongoose.Types.ObjectId[];
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: IFeedback;
  completedAt?: Date;
  createdAt: Date;
}

const InterviewQuestionSchema = new Schema<IInterviewQuestion>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tips: { type: String, required: true },
  category: { type: String, enum: ['hr', 'technical', 'behavioral'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const CodingChallengeSchema = new Schema<ICodingChallenge>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  approach: { type: String, required: true },
  solution: { type: String },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new Schema({
  technicalSkills: { type: Number },
  problemSolving: { type: Number },
  communication: { type: Number },
  strengths: { type: String },
  areasForImprovement: { type: String },
  overallScore: { type: Number },
});

const MockInterviewSchema = new Schema<IMockInterview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  interviewer: { type: String },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  notes: { type: String },
  questions: [{ type: Schema.Types.ObjectId, ref: 'InterviewQuestion' }],
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], required: true },
  feedback: { type: FeedbackSchema },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const InterviewQuestion = mongoose.model<IInterviewQuestion>('InterviewQuestion', InterviewQuestionSchema);
export const CodingChallenge = mongoose.model<ICodingChallenge>('CodingChallenge', CodingChallengeSchema);
export const MockInterview = mongoose.model<IMockInterview>('MockInterview', MockInterviewSchema);
