import { Schema, SchemaOptions, SchemaTypes, Types } from "mongoose";

export const defaultSchemaOptions: SchemaOptions = {
  timestamps: true,
  versionKey: false,
  toObject: {
    virtuals: true,
    getters: true,
  },
  toJSON: {
    virtuals: true,
    getters: true,
  },
};

/**
 * Merge schema with base schema for the project
 */
const mergeWithBaseSchema = (
  schemaDef: Schema,
  customSchemaOptions: Partial<SchemaOptions> = {}
) => {
  if (Object.keys(schemaDef).length === 0) {
    throw new Error("Cannot creae schema from empty schema definition");
  }

  return new Schema(
    {
      deletedAt: {
        type: SchemaTypes.Date,
      },
    },
    {
      ...defaultSchemaOptions,
      ...customSchemaOptions,
    }
  ).add(schemaDef);
};

export const generateMongoId = (seed?: string) => new Types.ObjectId(seed);
export default mergeWithBaseSchema;
