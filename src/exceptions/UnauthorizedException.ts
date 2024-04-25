import { HttpStatusCode } from "../libs/enums";
import { HttpException } from "./HttpException";

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatusCode.UNAUTHORIZED);
    this.name = "UnauthorizedException";
  }
}
