import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/shared/dtos/users/create-users.dto';
import { sanitizeUserFn } from 'src/shared/helpers/users.sanitizers';
import { _ICreateUser, _IDbUser } from 'src/shared/interfaces/users.interface';
import { BadRequestResponse, OkResponse } from 'src/shared/res/responses';
import { AggregationService } from 'src/shared/services/aggregation.service';
import { handleError } from 'src/shared/utils/errors';

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

  async registerUserAsync(dto: _ICreateUser) {
    try {
      const result = await this.createUser(dto);

      if (!result) {
        return new BadRequestResponse(
          'Something Bad Occured while creating your account'
        );
      }

      const { _id, ...user } = result;
      console.log(_id);

      return new OkResponse(
        user,
        `You have successfully created an acount with ${user.email}`
      );
    } catch (error) {
      return handleError(
        'UsersService.registerUserAsync',
        error,
        'An error occured while creating your account'
      );
    }
  }
}
