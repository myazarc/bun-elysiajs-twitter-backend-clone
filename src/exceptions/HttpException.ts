import { HttpStatusCode } from "../libs/enums";

export class HttpException extends Error {
  public statusCode: HttpStatusCode;
  constructor(message: string, status: HttpStatusCode) {
    super(message);
    this.name = "HttpException";
    this.statusCode = status;
  }
}
