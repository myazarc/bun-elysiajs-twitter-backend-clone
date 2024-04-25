import { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  user: Schema.Types.ObjectId;
  tweet: Schema.Types.ObjectId;
}
