// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Request } from "express-serve-static-core";
import { ILoggedInUser } from "interface";


declare module "express-serve-static-core" {
  interface Request {
    user: ILoggedInUser
    location: string
  }

  interface Session {
    user: ILoggedInUser
  }
}
