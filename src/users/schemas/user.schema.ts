import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

import { ProfileDto } from "../dto/profile.dto";

export type UserDocument = User & Document;

/**
 * The class representing a User in the database.
 */
@Schema()
export class User {
  @Prop({
    unique: true,
  })
  userId: string;

  @Prop()
  name: string;

  @Prop()
  joinDate: Date;

  @Prop()
  profile: ProfileDto;
}

export const UserSchema = SchemaFactory.createForClass(User);
