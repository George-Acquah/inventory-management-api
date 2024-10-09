import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { UserConstraints } from '../enums/users.enum';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema()
export class Profile {
  @Prop({ required: false, type: String, default: null, lowercase: true })
  first_name: {
    maxlength: [
      UserConstraints.FIRSTNAME_MAXVALUE,
      UserConstraints.FIRSTNAME_MAXLENGTH
    ];
  };

  @Prop({ required: false, type: String, default: null, lowercase: true })
  last_name: {
    maxlength: [
      UserConstraints.LASTNAME_MAXVALUE,
      UserConstraints.LASTNAME_MAXLENGTH
    ];
  };

  @Prop({ required: false, type: String, default: null })
  contact_no: string;

  @Prop({ required: false, type: String, default: null, lowercase: true })
  area: string;

  @Prop({ required: false, type: String, default: null, lowercase: true })
  city: string;

  @Prop({ required: false, type: String, default: null, lowercase: true })
  state: string;

  @Prop({ required: false, type: String, default: null })
  pinCode: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  })
  user: User;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
