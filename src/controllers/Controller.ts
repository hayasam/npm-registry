import { RequestHandler } from "express";

export type HttpMethod = "GET" | "POST";

export interface Controller {
  readonly path: string;
  readonly method: HttpMethod;
  readonly handler: RequestHandler;
}
