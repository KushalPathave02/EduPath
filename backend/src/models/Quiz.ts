import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

export interface IQuizResponse extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  level: string;
  score: number;
  percent: number;
  totalQuestions: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  completedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

const QuizResponseSchema = new Schema<IQuizResponse>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  level: { type: String, required: true },
  score: { type: Number, required: true },
  percent: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [{
    questionId: { type: String, required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  completedAt: { type: Date, default: Date.now }
});

export const QuizQuestion = mongoose.model<IQuizQuestion>('QuizQuestion', QuizQuestionSchema);
export const QuizResponse = mongoose.model<IQuizResponse>('QuizResponse', QuizResponseSchema);
