import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }[];
  score: number;
  totalQuestions: number;
  createdAt: Date;
}

const QuizResultSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    domain: { type: String, required: true },
    answers: [
      {
        questionId: { type: String, required: true },
        answer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
