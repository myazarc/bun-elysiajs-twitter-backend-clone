import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { useSwagger } from "./libs/swagger";
import logger from "./libs/logger";

import "./database";
import { jwt } from "@elysiajs/jwt";
import { authApp } from "./auth";
import { errorHandling } from "./libs/error_handling";
import { account } from "./controllers/account";
import { UnauthorizedException } from "./exceptions/UnauthorizedException";
import { follow } from "./controllers/follow";
import { tweet } from "./controllers/tweet";
import { user } from "./controllers/user";
import { timeline } from "./controllers/timeline";
import { User } from "./database/schemas/user.schema";

const app = new Elysia()
  .use(errorHandling)
  .use(useSwagger())
  .use(cors())
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .get("/", () => ({ status: "ok" }), { detail: { tags: ["App"] } })
  .mapResponse(({ response }: any) => {
    let body = response;
    if (typeof body === "object") {
      return {
        success: true,
        data: body,
      };
    }
    return response;
  })
  .use(authApp)
  .guard(
    {
      beforeHandle: async ({ headers, jwt, request }) => {
        const auth = headers["authorization"];

        if (!auth) {
          throw new UnauthorizedException("Unauthorized");
        }

        const [type, token] = auth.split(" ");

        if (type !== "Bearer") {
          throw new UnauthorizedException("Unauthorized");
        }

        const { username }: any = await jwt.verify(token);

        if (!username) {
          throw new UnauthorizedException("Unauthorized");
        }

        const user = await User.findOne({ username }).exec();

        if (!user) {
          throw new UnauthorizedException("Unauthorized");
        }

        // @ts-expect-error
        request.user = user;
      },
    },
    (app) => app.use(account).use(follow).use(tweet).use(user).use(timeline)
  )

  .listen(3000);

logger.info(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

export { app };
export type App = typeof app;
