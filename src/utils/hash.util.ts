import * as bcrypt from "bcryptjs";
import { createServiceError } from "./error.util";

export const hash = async (
  raw: string,
  { hasher = bcrypt.hash } = {}
) => {
  return await hasher(raw, 10);
};

export const compare = async (
  raw: string,
  hashed: string,
  { comparer = bcrypt.compare } = {}
) => {
  const matches = await comparer(raw, hashed);

  if (!matches) throw createServiceError("", "HASH_MISMATCH_ERROR");
};
