import Elysia, { t } from "elysia";
import { User } from "../../database/schemas/user.schema";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { Follow } from "../../database/schemas/follow.schema";
import { BadRequestException } from "../../exceptions/BadRequestException";
import { InternalServerException } from "../../exceptions/InternalServerException";

export const follow = new Elysia({
  prefix: "/follow",
})
  .post(
    "/follow",
    async ({ body, request }) => {
      const { followed } = body;

      const followedUser = await User.findOne({ username: followed }).exec();

      if (!followedUser) {
        throw new NotFoundException("Followed User not found");
      }
      // @ts-expect-error
      if (followedUser._id === request.user._id) {
        throw new BadRequestException("Cannot follow yourself");
      }

      const isAlreadyFollowing = await Follow.findOne({
        // @ts-expect-error
        follower: request.user._id,
        followed: followedUser._id,
      }).exec();

      if (isAlreadyFollowing) {
        throw new BadRequestException("Already following this user");
      }

      const follow = new Follow({
        // @ts-expect-error
        follower: request.user._id,
        followed: followedUser._id,
      });

      const status = await follow.save();

      if (!status) {
        throw new InternalServerException("Failed to follow user");
      }

      return { status: !!status };
    },
    {
      body: t.Object({
        followed: t.String(),
      }),
      detail: {
        tags: ["Follow"],
        security: [{ BearerAuth: [] }],
      },
    }
  )
  .post(
    "/unfollow",
    async ({ body, request }) => {
      const { followed } = body;

      const followedUser = await User.findOne({ username: followed }).exec();

      if (!followedUser) {
        throw new NotFoundException("Followed User not found");
      }

      const isAlreadyFollowing = await Follow.findOne({
        // @ts-expect-error
        follower: request.user._id,
        followed: followedUser._id,
      }).exec();

      if (!isAlreadyFollowing) {
        throw new BadRequestException("Not following this user");
      }

      const status = await Follow.deleteOne({
        // @ts-expect-error
        follower: request.user._id,
        followed: followedUser._id,
      }).exec();

      if (!status) {
        throw new InternalServerException("Failed to unfollow user");
      }

      return { status: !!status };
    },
    {
      body: t.Object({
        followed: t.String(),
      }),
      detail: {
        tags: ["Follow"],
        security: [{ BearerAuth: [] }],
      },
    }
  );
