import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/iuser.interface";

const schema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },

    avatar: { type: Schema.Types.ObjectId, ref: "file" },
  },
  {
    timestamps: true,
  }
);

schema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  Bun.password
    .hash(user.password, {
      algorithm: "bcrypt",
      cost: 4, // number between 4-31
    })
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((err) => {
      throw err;
    });
});

schema.methods.comparePassword = function (candidatePassword: string) {
  return Bun.password.verify(candidatePassword, this.password, "bcrypt");
};

export const User = model<IUser>("user", schema);
