import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ItemsService {
  private projectCreateFields = projectItemsFields;
  constructor(
    @InjectModel(Items.name) private itemsModel: Model<Items>,
    private readonly aggregationService: AggregationService
  ) {}
  async create(createItemDto: _TCreateItem) {
    try {
      const uniqueFields: Partial<Items> = { itemName: createItemDto.itemName };
      return await this.aggregationService.createDocumentPipeline<Items, _Item>(
        this.itemsModel,
        this.projectCreateFields,
        createItemDto,
        uniqueFields,
        ['Item', 'Item'],
        sanitizeItemFn
      );
    } catch (error) {
      throw error;
    }
  }

  templateItemModel() {
    return this.itemsModel;
  }

  async findAll(query?: string, page = 1, limit = 5) {
    const { project_fields, unwind_fields, lookups, count_fields } =
      FETCH_ITEMS_AGGREGATION;

    const conditions = createFilterConditions<Items>(filterItemsFields, query);

    return await this.aggregationService.dynamicDocumentsPipeline<
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
  }

  async findOne(id: string) {
    const { project_fields, unwind_fields, lookups, count_fields } =
      FETCH_ITEMS_AGGREGATION;

    return await this.aggregationService.dynamicDocumentsPipeline<Items, _Item>(
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
  }

  async update(
    id: string,
    updateItemDto: UpdateItemDto & { itemImage?: string[] }
  ) {
    try {
      const uniqueFields: Partial<Items> = {
        itemName: updateItemDto.itemName
      };
      console.log(updateItemDto);
      return await this.aggregationService.updateDocumentPipeline<Items, _Item>(
        this.itemsModel,
        this.projectCreateFields,
        id,
        updateItemDto,
        uniqueFields,
        ['Item', 'Item'],
        sanitizeItemFn
      );
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<string> {
    // Ensure you're using the correct ID type (string for MongoDB ObjectId)
    const item = await this.itemsModel.findById(id);

    if (!item) {
      throw new NotFoundException(
        'You cannot delete an item that does not exist'
      );
    }

    const deletionResult = await this.itemsModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    if (deletionResult.deletedCount === 0) {
      throw new NotFoundException('Failed to delete the item.');
    }

    return 'Item successfully deleted';
  }
}
