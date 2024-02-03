// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Session, type SessionData } from "express-session";
import { ILoggedInUser } from "interface/user.interface";

// Declare additional properties for session

declare module "express-session" {
  interface SessionData {
    user: ILoggedInUser
  }
}
