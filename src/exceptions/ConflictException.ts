import { HttpStatusCode } from "../libs/enums";
import { HttpException } from "./HttpException";

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatusCode.CONFLICT);
    this.name = "ConflictException";
  }
}
