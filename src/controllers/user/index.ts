import Elysia, { Context, t } from "elysia";
import { User } from "../../database/schemas/user.schema";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { Follow } from "../../database/schemas/follow.schema";
import { Tweet } from "../../database/schemas/tweet.schema";
import { TweetType } from "../../database/interfaces/itweet.interface";

export const user = new Elysia({
  prefix: "/user",
})
  .post(
    "/search",
    async ({ request, body: { username } }) => {
      username = username.trim();
      username = username.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      const users = await User.find({
        $or: [
          { username: { $regex: username, $options: "i" } },
          { displayName: { $regex: username, $options: "i" } },
        ],
        // @ts-expect-error
        _id: { $ne: request.user._id },
      })
        .populate("avatar")
        .exec();
      return {
        users: users.map((user) => ({
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar?.path || null,
        })),
      };
    },
    {
      body: t.Object({
        username: t.String({
          minLength: 3,
        }),
      }),
      detail: {
        tags: ["User"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .get(
    "/:username",
    async ({ params, request }) => {
      const user = await User.findOne({ username: params.username })
        .populate("avatar")
        .exec();

      if (!user) {
        throw new NotFoundException("User not found");
      }
      const followers = await Follow.find({ followed: user._id })
        .countDocuments()
        .exec();
      const following = await Follow.find({ follower: user._id })
        .countDocuments()
        .exec();
      const tweets = await Tweet.find({
        user: user._id,
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
      params: t.Object({
        username: t.String(),
      }),
      detail: {
        tags: ["User"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .get(
    "/:username/followers",
    async ({ params }) => {
      const user = await User.findOne({ username: params.username }).exec();

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const followers = await Follow.find({ followed: user._id })
        .populate("follower")
        .exec();

      return {
        followers: followers.map((follow: any) => ({
          username: follow.follower.username,
          displayName: follow.follower.displayName,
          avatar: follow.follower.avatar?.path || null,
        })),
      };
    },
    {
      params: t.Object({
        username: t.String(),
      }),
      detail: {
        tags: ["User"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .get(
    "/:username/following",
    async ({ params }) => {
      const user = await User.findOne({ username: params.username }).exec();

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const following = await Follow.find({ follower: user._id })
        .populate("followed")
        .exec();

      return {
        following: following.map((follow: any) => ({
          username: follow.followed.username,
          displayName: follow.followed.displayName,
          avatar: follow.followed.avatar?.path || null,
        })),
      };
    },
    {
      params: t.Object({
        username: t.String(),
      }),
      detail: {
        tags: ["User"],
        security: [{ BearerAuth: [] }],
      },
    }
  );
