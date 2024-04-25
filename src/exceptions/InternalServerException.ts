import { HttpStatusCode } from "../libs/enums";
import { HttpException } from "./HttpException";

export class InternalServerException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatusCode.INTERNAL_SERVER);
    this.name = "InternalServerException";
  }
}
