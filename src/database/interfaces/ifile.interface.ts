import { Document, Schema } from "mongoose";

export enum FileType {
  IMAGE = "image",
  VIDEO = "video",
}

export enum DocumentType {
  AVATAR = "avatar",
  COVER = "cover",
  TWEET = "tweet",
}

export interface IFile extends Document {
  type: FileType;
  documentType: DocumentType;
  path: string;
  user: Schema.Types.ObjectId;
  tweet: Schema.Types.ObjectId;
}
