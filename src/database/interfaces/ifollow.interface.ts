import { Document, Schema } from "mongoose";

export interface IFollow extends Document {
  follower: Schema.Types.ObjectId;
  followed: Schema.Types.ObjectId;
}
