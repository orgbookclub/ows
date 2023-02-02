import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { ProfileDto } from "../dto/profile.dto";
import { UserDto } from "../dto/user.dto";

/**
 * The class representing a User in the database.
 */
@Schema()
export class User extends UserDto {
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

/**
 * Class representing a User document in the database.
 */
export class UserDocument extends User {
  _id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
