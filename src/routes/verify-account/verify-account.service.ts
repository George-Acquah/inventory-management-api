import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { _IDbAccountVerification } from 'src/shared/interfaces/users.interface';

@Injectable()
export class AccountVerificationService {
  constructor(
    @InjectModel('AccountVerification')
    private accountVerificationModel: Model<_IDbAccountVerification>
  ) {}

  async findAccountVerificationRecord(token: string, email: string) {
    try {
      return await this.accountVerificationModel
        .findOne({
          verificationToken: token,
          email
        })
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async deleteAccountVerificationRecord(_id: any) {
    await this.accountVerificationModel.deleteOne({
      _id
    });
  }

  /**
   * verifyAccountToken Method
   *
   * Sends an account verification email to the specified recipient using a predefined email template.
   *
   * This method uses the Mailtrap API client to send an email with dynamically injected variables,
   * which are used to personalize the email content for the recipient.
   *
   * @param email - The recipient's email address.
   * @param userName - The name of the user to be included in the email.
   * @param verificationLink - The unique link for the user to verify their account.
   */
  async createVerificationToken(email: string) {
    try {
      // Generate a secure verification token
      const verificationToken = randomBytes(16).toString('hex');

      // Save the verification token and email to the AccountVerification collection
      const accountVerification = new this.accountVerificationModel({
        verificationToken,
        email
      });
      await accountVerification.save();
      return verificationToken;
    } catch (error) {
      console.error('Error in verifyAccountToken:', error); // Log any errors that occur
      throw new Error(
        `Failed to create a verification token: ${error.message}`
      );
    }
  }
}
