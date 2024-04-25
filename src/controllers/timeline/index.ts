import Elysia, { t } from "elysia";
import { Follow } from "../../database/schemas/follow.schema";
import { PipelineStage } from "mongoose";

export const timeline = new Elysia({
  prefix: "/timeline",
}).get(
  "/",
  async ({ request, query }) => {
    const limit = 20;
    let matchTweetCreated = {};
    if (query.time) {
      matchTweetCreated = {
        "tweets.createdAt": {
          $lt: new Date(query.time),
        },
      };
    }
    // @ts-expect-error
    const userId = request.user._id;

    const aggregate: PipelineStage[] = [
      {
        $match: {
          follower: userId,
        },
      },
      {
        $lookup: {
          from: "tweets",
          localField: "followed",
          foreignField: "user",
          as: "tweets",
        },
      },

      {
        $unwind: {
          path: "$tweets",
        },
      },
      {
        $match: {
          "tweets.type": {
            $in: ["tweet", "reply", "quote"],
          },
          ...matchTweetCreated,
        },
      },
      {
        $sort: {
          "tweets.createdAt": -1,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "tweets.user",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $lookup: {
          from: "files",
          localField: "user.avatar",
          foreignField: "_id",
          as: "avatar",
        },
      },
      {
        $lookup: {
          from: "favorites",
          localField: "tweets._id",
          foreignField: "tweet",
          as: "favorites",
        },
      },
      {
        $lookup: {
          from: "favorites",
          let: { tweetId: "$tweets._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$tweet", "$$tweetId"] },
                    { $eq: ["$user", userId] },
                  ],
                },
              },
            },
          ],
          as: "userFavorites",
        },
      },
      {
        $addFields: {
          favoriteCount: {
            $size: "$favorites",
          },
          isLikedByUser: { $gt: [{ $size: "$userFavorites" }, 0] },
        },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: "$tweets._id",
          user: {
            $first: "$user",
          },
          avatar: {
            $first: "$avatar",
          },
          type: "$tweets.type",
          content: "$tweets.content",
          parent: "$tweets.parent",
          files: "$tweets.files",
          createdAt: "$tweets.createdAt",
          favoriteCount: 1,
          isLikedByUser: 1,
        },
      },
      {
        $project: {
          _id: 1,
          user: { username: 1, displayName: 1, avatar: "$avatar.path" },
          type: 1,
          content: 1,
          parent: 1,
          files: 1,
          createdAt: 1,
          favoriteCount: 1,
          isLikedByUser: 1,
        },
      },
    ];

    const tweets = await Follow.aggregate(aggregate).exec();

    return { tweets };
  },
  {
    query: t.Object({
      time: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Timeline"],
      security: [{ BearerAuth: [] }],
    },
  }
);
