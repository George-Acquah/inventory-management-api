import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { createFilterConditions } from 'src/shared/constants/global.constants';
import {
  FETCH_TRANSACTIONS_AGGREGATION,
  filterTransactionsFields,
  projectTransactionsFields
} from 'src/shared/constants/transactions.constants';
import { sanitizeTransactionsFn } from 'src/shared/helpers/transactions.sanitizers';
import { _Item } from 'src/shared/interfaces/Items.interface';
import {
  _ITransaction,
  _TCreateTransaction
} from 'src/shared/interfaces/transactions.interface';
import { Transactions } from 'src/shared/schemas/transactions.schema';
import { AggregationService } from 'src/shared/services/aggregation.service';
import { ItemsService } from '../items/items.service';
import { Items } from 'src/shared/schemas/items.schema';

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
          'Item',
          'Item'
        ]);

      if (!createdTransaction) {
        throw new Error('Could not create the transaction');
      }

      // Iterate through each item in the transaction to update stock
      for (const item of createdTransaction.items) {
        const soldItem = await this.itemsService.findOne(item.itemId);

        if (!soldItem) {
          throw new NotFoundException(`Item with ID ${item.itemId} not found`);
        }

        const updatedStock = soldItem.stock - item.quantity;

        // Update stock for the item
        await this.itemsService.update(item.itemId, {
          stock: updatedStock
        });
      }

      return sanitizeTransactionsFn(createdTransaction);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query?: string, page = 1, limit = 5) {
    const { project_fields, unwind_fields, lookups, count_fields } =
      FETCH_TRANSACTIONS_AGGREGATION;

    const conditions = createFilterConditions<Transactions>(
      filterTransactionsFields,
      query
    );

    return await this.aggregationService.dynamicDocumentsPipeline<
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
  }

  async getAnalyticsData() {
    const itemsModel = this.itemsService.templateItemModel();
    return await this.aggregationService.analyticsPipeline<Transactions, Items>(
      this.transactionModel,
      itemsModel,
      {}
    );
  }

  async findOne(id: string) {
    const { project_fields, unwind_fields, lookups, count_fields } =
      FETCH_TRANSACTIONS_AGGREGATION;

    return await this.aggregationService.dynamicDocumentsPipeline<
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

  async remove(id: string): Promise<string> {
    // Ensure you're using the correct ID type (string for MongoDB ObjectId)
    const item = await this.transactionModel.findById(id);

    if (!item) {
      throw new NotFoundException(
        'You cannot delete an item that does not exist'
      );
    }

    const deletionResult = await this.transactionModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    if (deletionResult.deletedCount === 0) {
      throw new NotFoundException('Failed to delete the item.');
    }

    return 'Item successfully deleted';
  }
}
