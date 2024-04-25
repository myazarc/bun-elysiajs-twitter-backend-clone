import { Context } from "elysia";
import { IUser } from "../database/interfaces/iuser.interface";

export type AuthContext = Context & {
  request: {
    user: IUser;
  };
};
