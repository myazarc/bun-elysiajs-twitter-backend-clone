import { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  displayName: string;

  avatar: Schema.Types.ObjectId;

  comparePassword(candidatePassword: string): Promise<boolean>;
}
