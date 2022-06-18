import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProfileDto } from '../dto/profile.dto';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  joinDate: Date;

  @Prop()
  profile: ProfileDto;
}

export const UserSchema = SchemaFactory.createForClass(User);
