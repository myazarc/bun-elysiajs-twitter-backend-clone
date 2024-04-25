import Elysia, { t } from "elysia";
import { Tweet } from "../../database/schemas/tweet.schema";
import { TweetType } from "../../database/interfaces/itweet.interface";
import { BadRequestException } from "../../exceptions/BadRequestException";
import { InternalServerException } from "../../exceptions/InternalServerException";
import { Favorite } from "../../database/schemas/favorite.schema";
import { PipelineStage, Schema } from "mongoose";

export const tweetDTO = t.Object({
  content: t.String({
    minLength: 1,
    maxLength: 280,
  }),
  files: t.Optional(t.Array(t.String())),
});

export const getReadableTweet = async (id: any) => {
  const aggregate: PipelineStage[] = [
    {
      $match: {
        _id: new Schema.Types.ObjectId(id),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "user",
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
      $project: {
        _id: "$_id",
        user: {
          $first: "$user",
        },
        avatar: {
          $first: "$avatar",
        },
        type: "$type",
        content: "$content",
        parent: "$parent",
        files: "$files",
        createdAt: "$createdAt",
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
      },
    },
  ];

  const [tweetData] = await Tweet.aggregate(aggregate).exec();
  return tweetData;
};

export const tweet = new Elysia({
  prefix: "/tweet",
})
  .post(
    "/create",
    async ({ body, request }) => {
      if (body.content.trim().length === 0) {
        throw new BadRequestException("Content cannot be empty");
      }

      const tweet = new Tweet({
        content: body.content,
        // @ts-expect-error

        user: request.user._id,
        type: TweetType.TWEET,
      });
      const savedTweet = await tweet.save();

      if (!savedTweet) {
        throw new InternalServerException("Failed to create tweet");
      }

      const tweetData = await getReadableTweet(savedTweet._id);

      if (!tweetData) {
        throw new InternalServerException("Failed to fetch tweet");
      }

      return {
        tweet: {
          ...tweetData,
          favoriteCount: 0,
          isLikedByUser: false,
        },
      };
    },
    {
      body: tweetDTO,
      detail: {
        tags: ["Tweet"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .delete(
    "/:id",
    async ({ params, request }) => {
      const tweet = await Tweet.findById(params.id).exec();

      if (!tweet) {
        throw new BadRequestException("Tweet not found");
      }
      // @ts-expect-error
      if (tweet.user.toString() !== request.user._id.toString()) {
        throw new BadRequestException("You cannot delete this tweet");
      }

      const status = await tweet.deleteOne();

      if (!status) {
        throw new InternalServerException("Failed to delete tweet");
      }

      return { status: !!status };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Tweet"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/reply/:id",
    async ({ body, params, request }) => {
      if (body.content.trim().length === 0) {
        throw new BadRequestException("Content cannot be empty");
      }

      const tweet = await Tweet.findById(params.id).exec();

      if (!tweet) {
        throw new BadRequestException("Tweet not found");
      }

      const reply = new Tweet({
        content: body.content,
        // @ts-expect-error
        user: request.user._id,
        type: TweetType.REPLY,
        parent: tweet._id,
      });

      const replyTweet = await reply.save();

      if (!status) {
        throw new InternalServerException("Failed to create reply");
      }

      const tweetData = await getReadableTweet(replyTweet._id);

      if (!tweetData) {
        throw new InternalServerException("Failed to fetch reply");
      }

      return {
        tweet: {
          ...tweetData,
          favoriteCount: 0,
          isLikedByUser: false,
        },
      };
    },
    {
      body: tweetDTO,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Tweet"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/retweet/:id",
    async ({ params, request }) => {
      const tweet = await Tweet.findById(params.id).exec();

      if (!tweet) {
        throw new BadRequestException("Tweet not found");
      }

      const haveQuoteOrRetweet = await Tweet.findOne({
        parent: tweet._id,
        // @ts-expect-error
        user: request.user._id,
        type: { $in: [TweetType.QUOTE, TweetType.RETWEET] },
      }).exec();

      if (haveQuoteOrRetweet) {
        throw new BadRequestException(
          "You already quoted or retweeted this tweet"
        );
      }

      const reply = new Tweet({
        content: null,
        // @ts-expect-error
        user: request.user._id,
        type: TweetType.RETWEET,
        parent: tweet._id,
      });

      const status = await reply.save();

      if (!status) {
        throw new InternalServerException("Failed to create retweet");
      }

      return { retweet: status };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Tweet"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/qutoe/:id",
    async ({ params, request, body }) => {
      if (body.content.trim().length === 0) {
        throw new BadRequestException("Content cannot be empty");
      }

      const tweet = await Tweet.findById(params.id).exec();

      if (!tweet) {
        throw new BadRequestException("Tweet not found");
      }

      const haveQuoteOrRetweet = await Tweet.findOne({
        parent: tweet._id,
        // @ts-expect-error
        user: request.user._id,
        type: { $in: [TweetType.QUOTE, TweetType.RETWEET] },
      }).exec();

      if (haveQuoteOrRetweet) {
        throw new BadRequestException(
          "You already quoted or retweeted this tweet"
        );
      }

      const quote = new Tweet({
        content: body.content,
        // @ts-expect-error
        user: request.user._id,
        type: TweetType.QUOTE,
        parent: tweet._id,
      });

      const quoteTweet = await quote.save();

      if (!quoteTweet) {
        throw new InternalServerException("Failed to create reply");
      }

      const tweetData = await getReadableTweet(quoteTweet._id);

      if (!tweetData) {
        throw new InternalServerException("Failed to fetch quote");
      }

      const parent = await getReadableTweet(tweet._id);

      if (!parent) {
        throw new InternalServerException("Failed to fetch parent tweet");
      }

      return { quote: { ...tweetData, parent } };
    },
    {
      body: tweetDTO,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Tweet"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/unroll/:id",
    async ({ params, request, body }) => {
      if (body.content.trim().length === 0) {
        throw new BadRequestException("Content cannot be empty");
      }

      const tweet = await Tweet.findById(params.id).exec();

      if (!tweet) {
        throw new BadRequestException("Tweet not found");
      }

      const haveQuoteOrRetweet = await Tweet.findOne({
        parent: tweet._id,
        // @ts-expect-error
        user: request.user._id,
        type: { $in: [TweetType.QUOTE, TweetType.RETWEET] },
      }).exec();

      if (!haveQuoteOrRetweet) {
        throw new BadRequestException("You didn't quote or retweet this tweet");
      }

      const status = await Tweet.deleteOne({
        parent: tweet._id,
        // @ts-expect-error
        user: request.user._id,
        type: { $in: [TweetType.QUOTE, TweetType.RETWEET] },
      }).exec();

      if (!status) {
        throw new InternalServerException("Failed to unroll tweet");
      }

      return { status: !!status };
    },
    {
      body: tweetDTO,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Tweet"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/like/:id",
    async ({ params, request }) => {
      const tweet = await Tweet.findById(params.id).exec();

      if (!tweet) {
        throw new BadRequestException("Tweet not found");
      }

      const isAlreadyLiked = await Favorite.findOne({
        tweet: tweet._id,
        // @ts-expect-error
        user: request.user._id,
      }).exec();

      if (isAlreadyLiked) {
        throw new BadRequestException("Tweet already liked");
      }

      const like = new Favorite({
        tweet: tweet._id,
        // @ts-expect-error
        user: request.user._id,
      });

      const status = await like.save();

      if (!status) {
        throw new InternalServerException("Failed to like tweet");
      }

      const count = await Favorite.find({ tweet: tweet._id })
        .countDocuments()
        .exec();

      return { count };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Tweet"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/unlike/:id",
    async ({ params, request }) => {
      const tweet = await Tweet.findById(params.id).exec();

      if (!tweet) {
        throw new BadRequestException("Tweet not found");
      }

      const isAlreadyLiked = await Favorite.findOne({
        tweet: tweet._id,
        // @ts-expect-error
        user: request.user._id,
      }).exec();

      if (!isAlreadyLiked) {
        throw new BadRequestException("Tweet not liked");
      }

      const status = await Favorite.deleteOne({
        tweet: tweet._id,
        // @ts-expect-error
        user: request.user._id,
      }).exec();

      if (!status) {
        throw new InternalServerException("Failed to unlike tweet");
      }

      const count = await Favorite.find({ tweet: tweet._id })
        .countDocuments()
        .exec();

      return { count };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Tweet"],
        security: [{ BearerAuth: [] }],
      },
    }
  );
