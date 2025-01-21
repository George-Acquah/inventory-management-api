import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from 'src/shared/dtos/transactions/create-transaction.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/Jwt.guard';
import { ApiResponse } from 'src/shared/res/api.response';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @User() user: _ISafeUser
  ) {
    try {
      const data = await this.transactionsService.create({
        ...createTransactionDto,
        soldById: user._id,
        soldByName: user.name
      });

      if (data) {
        return new ApiResponse(
          200,
          `You have Successfully created your Transaction`,
          {}
        );
      }
    } catch (error) {
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error?.message ?? 'Something Bad Occured while logging in',
        {}
      );
    }
  }

  @Get()
  async findAllTransactions(
    @Query('q') query: string,
    @Query('currentPage', new ParseIntPipe()) currentPage: number,
    @Query('size', new ParseIntPipe()) size: number
  ) {
    try {
      const data = await this.transactionsService.findAll(
        query,
        currentPage,
        size
      );
      return new ApiResponse(200, 'Fetched vehicles Successfully', data);
    } catch (error) {
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error.message,
        {}
      );
    }
  }

  @Get('analytics')
  async getAnalyticsData() {
    try {
      const data = await this.transactionsService.getAnalyticsData();
      return new ApiResponse(200, 'Fetched analyics data Successfully', data);
    } catch (error) {
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error.message,
        {}
      );
    }
  }

  @Get(':id')
  async findOneTransaction(@Param('id') id: string) {
    try {
      const data = await this.transactionsService.findOne(id);
      return new ApiResponse(200, 'Fetched vehicles Successfully', data);
    } catch (error) {
      console.log(error);
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error.message,
        {}
      );
    }
  }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateTransactionDto: UpdateTransactionDto
  // ) {
  //   try {
  //     const data = await this.transactionsService.update(
  //       id,
  //       updateTransactionDto
  //     );
  //     return new ApiResponse(200, 'Transaction updated successfully', data);
  //   } catch (error) {
  //     console.log(error);
  //     return new ApiResponse(
  //       error?.response?.statusCode ?? 400,
  //       error.message,
  //       {}
  //     );
  //   }
  // }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.transactionsService.remove(id);
      return new ApiResponse(200, result, {});
    } catch (error) {
      console.log(error);
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error.message,
        {}
      );
    }
  }
}
