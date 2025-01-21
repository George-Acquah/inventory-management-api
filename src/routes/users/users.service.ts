import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/shared/dtos/users/create-users.dto';
import { sanitizeUserFn } from 'src/shared/helpers/users.sanitizers';
import { _IDbUser } from 'src/shared/interfaces/users.interface';
import { AggregationService } from 'src/shared/services/aggregation.service';

@Injectable()
export class UsersService {
  private projectCreateFields = ['email', 'userType'];
  constructor(
    @InjectModel('User') private userModel: Model<_IDbUser>,
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
    return sanitizedUser;
  }
}
