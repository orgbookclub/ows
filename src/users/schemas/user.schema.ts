import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { ProfileDto } from "../dto/profile.dto";

export type UserDocument = User & Document;

/**
 *
 */
@Schema()
export class User {
  @Prop({
    type: Number,
    unique: true,
  })
  userId: number;

  @Prop()
  name: string;

  @Prop()
  joinDate: Date;

  @Prop()
  profile: ProfileDto;
}

export const UserSchema = SchemaFactory.createForClass(User);
