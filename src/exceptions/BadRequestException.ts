import { HttpStatusCode } from "../libs/enums";
import { HttpException } from "./HttpException";

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatusCode.BAD_REQUEST);
    this.name = "BadRequestException";
  }
}
