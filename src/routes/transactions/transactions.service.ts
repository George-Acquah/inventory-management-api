import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { createFilterConditions } from 'src/shared/constants/global.constants';
import {
  FETCH_TRANSACTIONS_AGGREGATION,
  filterTransactionsFields,
  projectTransactionsFields
} from 'src/shared/constants/transactions.constants';
import { sanitizeTransactionsFn } from 'src/shared/helpers/transactions.sanitizers';
import { _Item } from 'src/shared/interfaces/items.interface';
import {
  _ITransaction,
  _TCreateTransaction
} from 'src/shared/interfaces/transactions.interface';
import { AggregationService } from 'src/shared/services/aggregation.service';
import { ItemsService } from '../items/items.service';
import { Items } from 'src/shared/schemas/items.schema';
import { Transactions } from 'src/shared/schemas/transaction/transaction';
import { BadRequestResponse, OkResponse } from 'src/shared/res/responses';
import { handleError } from 'src/shared/utils/errors';

@Injectable()
export class TransactionsService {
  private projectCreateFields = projectTransactionsFields;
  constructor(
    @InjectModel(Transactions.name)
    private transactionModel: Model<Transactions>,
    private readonly aggregationService: AggregationService,
    private readonly itemsService: ItemsService
  ) {}
  async create(createItemDto: _TCreateTransaction) {
    try {
      const createdTransaction =
        await this.aggregationService.createDocumentPipeline<
          Transactions,
          Transactions
        >(this.transactionModel, this.projectCreateFields, createItemDto, {}, [
          'Transaction',
          'Transaction'
        ]);

      if (!createdTransaction) {
        return new BadRequestResponse('Failed to create transaction');
      }

      // Update stock for each item
      for (const item of createdTransaction.items) {
        const soldItemResponse = await this.itemsService.findOne(item.itemId);

        if (!soldItemResponse.data || !soldItemResponse.data) {
          return new BadRequestResponse(
            `Item with ID ${item.itemId} not found`
          );
        }

        const updatedStock = soldItemResponse.data.stock - item.quantity;
        const updateResponse = await this.itemsService.update(item.itemId, {
          stock: updatedStock
        });

        if (!updateResponse.data) {
          return new BadRequestResponse(
            `Failed to update stock for item ${item.itemId}`
          );
        }
      }

      const sanitizedTransaction = sanitizeTransactionsFn(createdTransaction);
      return new OkResponse(
        sanitizedTransaction,
        'Transaction created successfully'
      );
    } catch (error) {
      return handleError(
        'TransactionsService.create',
        error,
        'An error occurred while creating the transaction'
      );
    }
  }

  async findAll(query?: string, page = 1, limit = 5) {
    try {
      const { project_fields, unwind_fields, lookups, count_fields } =
        FETCH_TRANSACTIONS_AGGREGATION;
      const conditions = createFilterConditions<Transactions>(
        filterTransactionsFields,
        query
      );

      const result = await this.aggregationService.dynamicDocumentsPipeline<
        Transactions,
        _ITransaction[]
      >(
        this.transactionModel,
        false,
        project_fields,
        query ? (conditions as any) : {},
        lookups,
        unwind_fields,
        count_fields,
        page,
        limit,
        sanitizeTransactionsFn
      );

      if (!result) {
        return new BadRequestResponse('No transactions found');
      }

      return new OkResponse(result, 'Transactions retrieved successfully');
    } catch (error) {
      return handleError(
        'TransactionsService.findAll',
        error,
        'An error occurred while fetching transactions'
      );
    }
  }

  async getAnalyticsData() {
    try {
      const itemsModel = this.itemsService.templateItemModel();
      const result = await this.aggregationService.analyticsPipeline<
        Transactions,
        Items
      >(this.transactionModel, itemsModel, {});

      if (!result) {
        return new BadRequestResponse('Failed to fetch analytics data');
      }

      return new OkResponse(result, 'Analytics data retrieved successfully');
    } catch (error) {
      return handleError(
        'TransactionsService.getAnalyticsData',
        error,
        'An error occurred while fetching analytics data'
      );
    }
  }

  async findOne(id: string) {
    try {
      const { project_fields, unwind_fields, lookups, count_fields } =
        FETCH_TRANSACTIONS_AGGREGATION;

      const result = await this.aggregationService.dynamicDocumentsPipeline<
        Transactions,
        _Item
      >(
        this.transactionModel,
        false,
        project_fields,
        { _id: new mongoose.Types.ObjectId(id) },
        lookups,
        unwind_fields,
        count_fields,
        1,
        1,
        sanitizeTransactionsFn
      );

      if (!result) {
        return new BadRequestResponse('Transaction not found');
      }

      return new OkResponse(result, 'Transaction retrieved successfully');
    } catch (error) {
      return handleError(
        'TransactionsService.findOne',
        error,
        'An error occurred while fetching the transaction'
      );
    }
  }

  // async update(
  //   id: string,
  //   updateItemDto: UpdateTransactionDto
  // ): Promise<Transactions> {
  //   try {
  //     const uniqueFields: Partial<Transactions> = {
  //       items: updateItemDto.items[0]?.itemName // Accessing the first item's name safely
  //     };

  //     return await this.aggregationService.updateDocumentPipeline<
  //       Transactions,
  //       _ITransaction
  //     >(
  //       this.transactionModel,
  //       this.projectCreateFields,
  //       id,
  //       updateItemDto,
  //       uniqueFields,
  //       ['Item', 'Item'],
  //       sanitizeTransactionsFn
  //     );
  //   } catch (error) {
  //     console.error('Error updating transaction:', error);
  //     throw new Error('Failed to update transaction');
  //   }
  // }

  async remove(id: string) {
    try {
      const transaction = await this.transactionModel.findById(id);

      if (!transaction) {
        return new BadRequestResponse('Transaction not found');
      }

      const deletionResult = await this.transactionModel.deleteOne({
        _id: new mongoose.Types.ObjectId(id)
      });

      if (deletionResult.deletedCount === 0) {
        return new BadRequestResponse('Failed to delete transaction');
      }

      return new OkResponse(null, 'Transaction deleted successfully');
    } catch (error) {
      return handleError(
        'TransactionsService.remove',
        error,
        'An error occurred while deleting the transaction'
      );
    }
  }
}
