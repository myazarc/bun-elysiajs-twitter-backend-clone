import Elysia, { Context, t } from "elysia";
import { User } from "../../database/schemas/user.schema";
import { Follow } from "../../database/schemas/follow.schema";
import { Tweet } from "../../database/schemas/tweet.schema";
import { TweetType } from "../../database/interfaces/itweet.interface";
import { UPLOAD_PATH } from "../../libs/utils";
import path from "path";
import { File } from "../../database/schemas/file.schema";
import {
  DocumentType,
  FileType,
} from "../../database/interfaces/ifile.interface";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { AuthContext } from "../../types/auth.context";

export const account = new Elysia({
  prefix: "/account",
})
  .get(
    "/me",
    async ({ request }: AuthContext) => {
      const user = await User.findById(request.user._id)
        .populate("avatar")
        .exec();

      if (!user) throw new NotFoundException("User not found");

      const followers = await Follow.find({ followed: request.user._id })
        .countDocuments()
        .exec();
      const following = await Follow.find({ follower: request.user._id })
        .countDocuments()
        .exec();
      const tweets = await Tweet.find({
        user: request.user._id,
        type: TweetType.TWEET,
      })
        .countDocuments()
        .exec();
      return {
        user: {
          username: user.username,

          displayName: user.displayName,
          avatar: user.avatar?.path || null,
        },
        followers,
        following,
        tweets,
      };
    },
    {
      detail: {
        tags: ["Account"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/avatar",
    async ({ body: { avatar }, request }) => {
      const arrayBuffer = await avatar.arrayBuffer();

      const filePath = `/avatars/${Date.now()}-${avatar.name}`;
      await Bun.write(path.join(UPLOAD_PATH, filePath), arrayBuffer);

      const file = new File({
        path: filePath,
        type: FileType.IMAGE,
        documentType: DocumentType.AVATAR,
        // @ts-expect-error
        user: request.user._id,
      });

      await file.save();
      // @ts-expect-error
      await User.findByIdAndUpdate(request.user._id, {
        avatar: file._id,
      }).exec();

      return { status: "ok" };
    },
    {
      type: "multipart/form-data",
      body: t.Object({
        avatar: t.File({
          type: ["image/jpeg", "image/png", "image/webp"],
          maxSize: "1m",
        }),
      }),
      detail: {
        tags: ["Account"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/cover",
    async ({ body: { avatar }, request }) => {
      const arrayBuffer = await avatar.arrayBuffer();

      const filePath = `/covers/${Date.now()}-${avatar.name}`;
      await Bun.write(path.join(UPLOAD_PATH, filePath), arrayBuffer);

      const file = new File({
        path: filePath,
        type: FileType.IMAGE,
        documentType: DocumentType.COVER,
        // @ts-expect-error
        user: request.user._id,
      });

      await file.save();
      // @ts-expect-error
      await User.findByIdAndUpdate(request.user._id, {
        avatar: file._id,
      }).exec();

      return { status: "ok" };
    },
    {
      type: "multipart/form-data",
      body: t.Object({
        avatar: t.File({
          type: ["image/jpeg", "image/png", "image/webp"],
          maxSize: "1m",
        }),
      }),
      detail: {
        tags: ["Account"],
        security: [{ BearerAuth: [] }],
      },
    }
  );
