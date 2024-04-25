import { Document, Schema } from "mongoose";

export enum TweetType {
  TWEET = "tweet",
  RETWEET = "retweet",
  QUOTE = "quote",
  REPLY = "reply",
}

export interface ITweet extends Document {
  user: Schema.Types.ObjectId;
  type: TweetType;
  content: string;

  parent: Schema.Types.ObjectId;
  files: Schema.Types.ObjectId[];
}
