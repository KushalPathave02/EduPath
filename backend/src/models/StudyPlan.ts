import mongoose, { Document, Schema } from 'mongoose';

export interface ITopic {
  _id?: mongoose.Types.ObjectId;
  name: string;
  resources: string[];
  completed: boolean;
  dueDate?: Date;
  notes?: string;
  completedAt?: Date;
}

export interface IStudySession {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export interface ITestScore {
  topic: string;
  score: number;
  date: Date;
}

export interface IStudyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  topics: ITopic[];
  studySchedule: IStudySession[];
  testScores: ITestScore[];
  progress: number;
  startDate: Date;
  targetCompletionDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema: Schema = new Schema({
  name: { type: String, required: true },
  resources: [{ type: String }],
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  notes: { type: String },
  completedAt: { type: Date },
});

const TestScoreSchema: Schema = new Schema({
  topic: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}, { _id: false });

const StudySessionSchema: Schema = new Schema({
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

const StudyPlanSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    domain: { type: String, required: true },
    topics: [TopicSchema],
    studySchedule: [StudySessionSchema],
    testScores: [TestScoreSchema],
    progress: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    targetCompletionDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);
