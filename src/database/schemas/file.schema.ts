import { Schema, model } from "mongoose";
import { IFile } from "../interfaces/ifile.interface";

const schema = new Schema<IFile>(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    documentType: {
      type: String,
      enum: ["avatar", "cover", "tweet"],
      required: true,
    },
    path: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "user" },
    tweet: { type: Schema.Types.ObjectId, ref: "tweet" },
  },
  {
    timestamps: true,
  }
);

export const File = model<IFile>("file", schema);
