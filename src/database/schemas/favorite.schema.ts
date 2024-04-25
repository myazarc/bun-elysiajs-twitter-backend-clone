import { Schema, model } from "mongoose";
import { IFavorite } from "../interfaces/ifavorite.interface";

const schema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    tweet: { type: Schema.Types.ObjectId, ref: "tweet", required: true },
  },
  {
    timestamps: true,
  }
);

export const Favorite = model<IFavorite>("favorite", schema);
