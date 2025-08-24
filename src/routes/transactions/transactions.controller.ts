import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from 'src/shared/dtos/transactions/create-transaction.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/Jwt.guard';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import {
  Delete,
  Get,
  Post
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import {
  Body,
  Param,
  Query
} from '@nestjs/common/decorators/http/route-params.decorator';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @User() user: _ISafeUser
  ) {
    return await this.transactionsService.create({
      ...createTransactionDto,
      soldById: user._id,
      soldByName: user.name
    });
  }

  @Get()
  async findAllTransactions(
    @Query('q') query: string,
    @Query('currentPage', new ParseIntPipe()) currentPage: number,
    @Query('size', new ParseIntPipe()) size: number
  ) {
    return await this.transactionsService.findAll(query, currentPage, size);
  }

  @Get('analytics')
  async getAnalyticsData() {
    return await this.transactionsService.getAnalyticsData();
  }

  @Get(':id')
  async findOneTransaction(@Param('id') id: string) {
    return await this.transactionsService.findOne(id);
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
    return await this.transactionsService.remove(id);
  }
}
