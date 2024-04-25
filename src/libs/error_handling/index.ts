import Elysia, { ValidationError } from "elysia";
import { AppException } from "../../exceptions/AppException";
import { HttpException } from "../../exceptions/HttpException";
import { BadRequestException } from "../../exceptions/BadRequestException";
import { InternalServerException } from "../../exceptions/InternalServerException";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { UnauthorizedException } from "../../exceptions/UnauthorizedException";
import { ConflictException } from "../../exceptions/ConflictException";

const errorHandling = () =>
  new Elysia({
    name: "errorHandling",
  })
    .error(AppException.name, AppException)
    .error(HttpException.name, HttpException)
    .error(BadRequestException.name, BadRequestException)
    .error(InternalServerException.name, InternalServerException)
    .error(NotFoundException.name, NotFoundException)
    .error(UnauthorizedException.name, UnauthorizedException)
    .error(ConflictException.name, ConflictException)
    .onError(({ code: name, error, set }) => {
      if (error instanceof HttpException) {
        set.status = error?.statusCode;
        return {
          success: false,
          message: error.message || error.toString()?.replace("Error: ", ""),
        };
      }

      if (error instanceof ValidationError) {
        set.status = 400;

        let errors;

        try {
          errors = JSON.parse(error.message);
        } catch (err) {}

        return {
          success: false,
          message:
            errors?.message ||
            error.message ||
            error.toString()?.replace("Error: ", ""),
        };
      }
      set.status = 500;
      return {
        success: false,
        message: error.message || error.toString()?.replace("Error: ", ""),
      };
    });
export { errorHandling };
