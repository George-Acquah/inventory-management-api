import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { createFilterConditions } from 'src/shared/constants/global.constants';
import {
  FETCH_ITEMS_AGGREGATION,
  filterItemsFields,
  projectItemsFields
} from 'src/shared/constants/items.constants';
import { UpdateItemDto } from 'src/shared/dtos/items/update-item.dto';
import { sanitizeItemFn } from 'src/shared/helpers/items.sanitizers';
import { _Item, _TCreateItem } from 'src/shared/interfaces/items.interface';
// import { _IDbItem } from 'src/shared/interfaces/items.interface';
import { Items } from 'src/shared/schemas/items.schema';
import { AggregationService } from 'src/shared/services/aggregation.service';
import { BadRequestResponse, OkResponse } from 'src/shared/res/responses';
import { handleError } from 'src/shared/utils/errors';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';

@Injectable()
export class ItemsService {
  private projectCreateFields = projectItemsFields;
  constructor(
    @InjectModel(Items.name) private itemsModel: Model<Items>,
    private readonly aggregationService: AggregationService
  ) {}

  templateItemModel() {
    return this.itemsModel;
  }
  async create(createItemDto: _TCreateItem) {
    try {
      const uniqueFields: Partial<Items> = { itemName: createItemDto.itemName };
      const result = await this.aggregationService.createDocumentPipeline<
        Items,
        _Item
      >(
        this.itemsModel,
        this.projectCreateFields,
        createItemDto,
        uniqueFields,
        ['Item', 'Item'],
        sanitizeItemFn
      );

      if (!result) {
        return new BadRequestResponse('Failed to create item');
      }

      return new OkResponse(
        result,
        `Item ${result.itemName} created successfully`
      );
    } catch (error) {
      return handleError(
        'ItemsService.create',
        error,
        'An error occurred while creating the item'
      );
    }
  }

  async findAll(query?: string, page = 1, limit = 5) {
    try {
      const { project_fields, unwind_fields, lookups, count_fields } =
        FETCH_ITEMS_AGGREGATION;
      const conditions = createFilterConditions<Items>(
        filterItemsFields,
        query
      );

      const result = await this.aggregationService.dynamicDocumentsPipeline<
        Items,
        _Item[]
      >(
        this.itemsModel,
        false,
        project_fields,
        query ? (conditions as any) : {},
        lookups,
        unwind_fields,
        count_fields,
        page,
        limit,
        sanitizeItemFn
      );

      if (!result) {
        return new BadRequestResponse('No items found');
      }

      return new OkResponse(result, 'Items retrieved successfully');
    } catch (error) {
      return handleError(
        'ItemsService.findAll',
        error,
        'An error occurred while fetching items'
      );
    }
  }

  async findOne(id: string) {
    try {
      const { project_fields, unwind_fields, lookups, count_fields } =
        FETCH_ITEMS_AGGREGATION;

      const result = await this.aggregationService.dynamicDocumentsPipeline<
        Items,
        _Item
      >(
        this.itemsModel,
        true,
        project_fields,
        { _id: new mongoose.Types.ObjectId(id) },
        lookups,
        unwind_fields,
        count_fields,
        1,
        1,
        sanitizeItemFn
      );

      if (!result) {
        return new BadRequestResponse('Item not found');
      }

      return new OkResponse(result, 'Item retrieved successfully');
    } catch (error) {
      return handleError(
        'ItemsService.findOne',
        error,
        'An error occurred while fetching the item'
      );
    }
  }

  async update(
    id: string,
    updateItemDto: UpdateItemDto & { itemImage?: string[] }
  ) {
    try {
      const uniqueFields: Partial<Items> = {
        itemName: updateItemDto.itemName
      };

      const result = await this.aggregationService.updateDocumentPipeline<
        Items,
        _Item
      >(
        this.itemsModel,
        this.projectCreateFields,
        id,
        updateItemDto,
        uniqueFields,
        ['Item', 'Item'],
        sanitizeItemFn
      );

      if (!result) {
        return new BadRequestResponse('Failed to update item');
      }

      return new OkResponse(
        result,
        `Item ${result.itemName} updated successfully`
      );
    } catch (error) {
      return handleError(
        'ItemsService.update',
        error,
        'An error occurred while updating the item'
      );
    }
  }

  async remove(id: string) {
    try {
      const item = await this.itemsModel.findById(id);

      if (!item) {
        return new BadRequestResponse('Item not found');
      }

      const deletionResult = await this.itemsModel.deleteOne({
        _id: new mongoose.Types.ObjectId(id)
      });

      if (deletionResult.deletedCount === 0) {
        return new BadRequestResponse('Failed to delete item');
      }

      return new OkResponse(null, 'Item deleted successfully');
    } catch (error) {
      return handleError(
        'ItemsService.remove',
        error,
        'An error occurred while deleting the item'
      );
    }
  }
}
