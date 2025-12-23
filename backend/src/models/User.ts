import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Add the method to the interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  domain?: string;
  studySchedule?: {
    days: string[];
    timeSlots: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    domain: { type: String },
    studySchedule: {
      days: [{ type: String }],
      timeSlots: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
