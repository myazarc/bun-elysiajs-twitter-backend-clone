import Elysia, { t } from "elysia";
import { User } from "./database/schemas/user.schema";
import { UnauthorizedException } from "./exceptions/UnauthorizedException";
import { mongo } from "mongoose";
import { ConflictException } from "./exceptions/ConflictException";
import { jwt } from "@elysiajs/jwt";

export const loginDTO = t.Object({
  username: t.String(),
  password: t.String(),
});

export const registerDTO = t.Object({
  email: t.String({
    format: "email",
  }),
  username: t.String(),
  displayName: t.String(),
  password: t.String(),
});

const authApp = new Elysia({
  prefix: "/auth",
})
  .use(
    jwt({
      name: "jwt",
      secret: "secret",
    })
  )
  .post(
    "/login",
    async ({ body, jwt }: any) => {
      const user = await User.findOne({ username: body.username })
        .select("+password")
        .exec();

      if (!user)
        throw new UnauthorizedException("Invalid username or password");

      const isPasswordMatch = await user.comparePassword(body.password);

      if (!isPasswordMatch)
        throw new UnauthorizedException("Invalid username or password");

      const token = await jwt.sign({ username: user.username });

      return {
        token,
      };
    },
    {
      body: loginDTO,
      detail: {
        tags: ["Auth"],
      },
    }
  )
  .post(
    "/register",
    async ({ body }: any) => {
      try {
        const user = new User({ ...body, avatar: null });
        await user.save();

        if (user) {
          return {
            message: "User created successfully",
          };
        }
      } catch (error) {
        if (error instanceof mongo.MongoServerError) {
          if (error.code === 11000) {
            if (error.message.includes("username"))
              throw new ConflictException("Username already exists");
            if (error.message.includes("email"))
              throw new ConflictException("Email already exists");
          } else {
            throw error;
          }
        }
        throw error;
      }
    },
    {
      body: registerDTO,
      detail: {
        tags: ["Auth"],
      },
    }
  );

export { authApp };
