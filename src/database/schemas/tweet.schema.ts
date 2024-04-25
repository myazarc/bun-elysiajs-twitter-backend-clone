import { Schema, model } from "mongoose";
import { IFollow } from "../interfaces/ifollow.interface";
import { ITweet } from "../interfaces/itweet.interface";

const schema = new Schema<ITweet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    type: { type: String, enum: ["tweet", "retweet", "reply"], required: true },
    content: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: "tweet" },

    files: [{ type: Schema.Types.ObjectId, ref: "file" }],
  },
  {
    timestamps: true,
  }
);

export const Tweet = model<IFollow>("tweet", schema);
