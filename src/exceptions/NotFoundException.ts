import { HttpStatusCode } from "../libs/enums";
import { HttpException } from "./HttpException";

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatusCode.NOT_FOUND);
    this.name = "NotFoundException";
  }
}
