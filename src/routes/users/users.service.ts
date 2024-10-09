import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/shared/dtos/users/create-users.dto';
import { sanitizeUserFn } from 'src/shared/helpers/users.sanitizers';
import {
  _ICloudRes,
  _IDbUserImage
} from 'src/shared/interfaces/images.interface';
import { _IDbProfile, _IDbUser } from 'src/shared/interfaces/users.interface';
import { AggregationService } from 'src/shared/services/aggregation.service';

@Injectable()
export class UsersService {
  private projectCreateFields = ['email', 'userType'];
  constructor(
    @InjectModel('User') private userModel: Model<_IDbUser>,
    @InjectModel('Profile') private profileModel: Model<_IDbProfile>,
    @InjectModel('UserImage') private userImageModel: Model<_IDbUserImage>,
    private readonly aggregationService: AggregationService
  ) {}
  /* used by  modules to search user by email */
  async findUser(email: string): Promise<_IDbUser> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new NotFoundException(`User with email ${email} does not exist.`);
      } else {
        return user;
      }
    } catch (error) {
      throw error;
    }
  }

  async returnId(email: string) {
    return await this.aggregationService.returnIdPipeline(
      this.userModel,
      email
    );
  }

  async addUserImage(userImage: _ICloudRes, id: string) {
    try {
      const { publicUrl, ...image } = userImage;
      console.log(publicUrl); // You can remove this in the storage service

      const savedImage = new this.userImageModel({
        userId: id,
        ...image
      });

      await savedImage.save();

      return savedImage;
    } catch (error) {
      throw new Error(error);
    }
  }

  async createProfile(user_id: string) {
    try {
      const existingProfile = await this.profileModel.findOne({
        user: user_id
      });
      if (existingProfile) {
        throw new ConflictException(`This user already has a profile exists`);
      }
      const profile = new this.profileModel({ user: user_id });
      await profile.save();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createUser(userDetails: CreateUserDto): Promise<_ISafeUser> {
    const uniqueFields = { email: userDetails.email };

    const sanitizedUser = await this.aggregationService.createDocumentPipeline<
      _IDbUser,
      _ISafeUser
    >(
      this.userModel,
      this.projectCreateFields,
      userDetails,
      uniqueFields,
      ['Email', 'Account'],
      sanitizeUserFn
    );
    await this.createProfile(sanitizedUser._id);
    return sanitizedUser;
  }
}
