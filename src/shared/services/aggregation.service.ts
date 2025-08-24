import {
  Types,
  Model,
  Document,
  FilterQuery,
  PipelineStage,
  AnyExpression
} from 'mongoose';
import { _ILookup } from '../interfaces/aggregation.interface';
import { _IAnalyticsData } from '../interfaces/transactions.interface';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class AggregationService {
  async createDocumentPipeline<T extends Document, S>(
    model: Model<T>,
    projectFields: string[],
    data: Partial<T>,
    uniqueFields: Partial<Record<keyof T, any>> | null, // Allow null if uniqueness check is optional
    errHelper: string[],
    sanitizeFn?: (doc: T) => S
  ): Promise<S> {
    try {
      // Check for existing document only if uniqueFields is provided
      if (uniqueFields && Object.keys(uniqueFields).length > 0) {
        const existingDoc = await model.findOne(uniqueFields);
        if (existingDoc) {
          throw new ConflictException(`${errHelper[0]} already exists`);
        }
      }

      const newDoc = new model(data);
      await newDoc.save();

      const project = projectFields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

      const pipeline = await model.aggregate([
        { $match: { _id: newDoc._id } },
        { $project: project }
      ]);

      if (sanitizeFn) {
        return sanitizeFn(pipeline[0]);
      }
      return pipeline[0];
    } catch (error) {
      throw new Error(`Error creating ${errHelper[1]}: ${error.message}`);
    }
  }

  async updateDocumentPipeline<T extends Document, S>(
    model: Model<T>,
    projectFields: string[],
    id: string,
    data: Partial<T>,
    uniqueFields: Partial<Record<keyof T, any>>,
    errHelper: string[],
    sanitizeFn?: (doc: T) => S
  ): Promise<S> {
    try {
      // Check if the document to update exists
      const existingDoc = await model.findById(id);
      if (!existingDoc) {
        throw new NotFoundException(`${errHelper[0]} not found`);
      }

      // Ensure that the updated fields do not violate uniqueness constraints
      const conflictingDoc = await model.findOne({
        ...uniqueFields,
        _id: { $ne: new Types.ObjectId(id) }
      });
      if (conflictingDoc) {
        throw new ConflictException(`${errHelper[0]} already exists`);
      }

      // Update the document
      await model.findByIdAndUpdate(id, data, { new: true });

      const project = projectFields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

      const pipeline = await model.aggregate([
        { $match: { _id: existingDoc._id } },
        { $project: project }
      ]);

      if (sanitizeFn) {
        // Sanitize and return the updated document
        return sanitizeFn(pipeline[0]);
      }

      return pipeline[0];
    } catch (error) {
      throw new Error(`Error updating ${errHelper[1]}: ${error.message}`);
    }
  }

  async pageNumbersPipeline<T extends Document>(
    model: Model<T>,
    fieldNames: string[],
    query = '',
    items: number,
    options?: object
  ): Promise<number> {
    try {
      // Construct simple conditions for each field to search using the query string
      const simpleConditions = fieldNames.map((field) => ({
        [field]: { $regex: query, $options: 'i' } // Case-insensitive regex search
      }));

      // Combine the conditions using the $or operator to match documents with the query in any of the fields
      const conditions = {
        $or: simpleConditions
      } as unknown as FilterQuery<T>[];

      // Count the total number of documents matching the combined conditions
      const totalCount = await model
        .countDocuments({ ...options, ...conditions }) // Apply additional options and conditions
        .exec();

      // Calculate the total number of pages needed
      const totalPages = Math.ceil(totalCount / items);

      return totalPages; // Return the total number of pages
    } catch (error) {
      // Provide a detailed error message and rethrow the error
      throw new Error(`Error calculating page numbers: ${error.message}`);
    }
  }

  async returnIdPipeline<T extends Document>(
    model: Model<T>,
    identifier: string // Rename to identifier for flexibility
  ): Promise<string | null> {
    try {
      // Aggregate pipeline to match document by _id or email and return the _id as a string
      const pipeline = (await model.aggregate([
        {
          $match: {
            $or: [
              { _id: new Types.ObjectId(identifier) }, // Match by _id
              { email: identifier } // Match by email
            ]
          }
        },
        {
          $project: {
            _id: 1 // Project the _id field only
          }
        },
        {
          $limit: 1 // Limit to 1 result
        }
      ])) as Array<{ _id: Types.ObjectId }> | []; // Ensure type casting for returned pipeline results

      // Check if a document was found and return its _id as a string
      return pipeline.length > 0 ? pipeline[0]._id.toString() : null;
    } catch (error) {
      console.error('Error in returnIdPipeline:', error);
      throw error; // Rethrow the error
    }
  }

  async dynamicDocumentsPipeline<T extends Document, S>(
    model: Model<T>,
    return_as_object: boolean,
    project_fields: (keyof T)[],
    matcher: Partial<Record<keyof T, any>>,
    lookup_data?: _ILookup[],
    unwind_fields?: (keyof T)[],
    countFields?: string[], // New parameter to specify fields to count
    currentPage = 1,
    items = 10,
    sanitizeFn?: (doc: T) => AnyExpression
  ): Promise<S> {
    try {
      if (currentPage < 1 || items < 1) {
        throw new Error('currentPage and items must be positive integers');
      }

      const pipeline: PipelineStage[] = [{ $match: matcher }];

      // Lookup stages
      lookup_data?.forEach((data) => {
        pipeline.push({
          $lookup: {
            from: data.from,
            as: data.as,
            localField: data.localField ?? '_id',
            foreignField: data.foreignField
          }
        });
      });

      // Unwind stages
      unwind_fields?.forEach((field) => {
        pipeline.push({
          $unwind: {
            path: `$${String(field)}`,
            preserveNullAndEmptyArrays: true
          }
        });
      });

      // Project stage
      const project: Record<string, any> = {};
      project_fields.forEach((field) => {
        project[String(field)] = 1;
      });

      // Add fields to count
      countFields?.forEach((field) => {
        project[`${String(field)}_count`] = { $size: `$${String(field)}` };
      });

      if (Object.keys(project).length > 0) {
        pipeline.push({ $project: project });
      }

      // Pagination stages
      const offset = (currentPage - 1) * items;
      pipeline.push({ $skip: offset }, { $limit: items });

      // Execute pipeline
      const result = await model.aggregate(pipeline);

      // Return based on the 'return_as_object' flag
      if (return_as_object) {
        return sanitizeFn ? (sanitizeFn(result[0]) as unknown as S) : result[0];
      } else {
        return sanitizeFn
          ? (result.map((item) => sanitizeFn(item)) as unknown as S)
          : (result as unknown as S);
      }
    } catch (error) {
      throw new Error(`Error fetching filtered documents: ${error.message}`);
    }
  }

  async analyticsPipeline<T extends Document, S extends Document>(
    transactionsModel: Model<T>,
    itemsModel: Model<S>, // The model for the items collection
    matcher: Partial<Record<keyof T, any>> = {}
  ): Promise<_IAnalyticsData> {
    try {
      // Pipeline for transactions analytics
      const transactionsPipeline: PipelineStage[] = [
        { $match: matcher },

        {
          $unwind: {
            path: '$items',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $group: {
            _id: null, // Grouping over the entire collection
            totalQuantitySold: { $sum: '$items.quantity' }, // Sum of all quantities in `items`
            totalAmountSold: { $sum: '$totalPrice' } // Sum of totalPrice across all documents
          }
        },

        {
          $project: {
            _id: 0, // Exclude the _id field
            totalQuantitySold: 1, // Include totalQuantitySold in the result
            totalAmountSold: 1 // Include totalAmountSold in the result
          }
        }
      ];

      const itemsPipeline: PipelineStage[] = [
        {
          $group: {
            _id: null,
            totalItemsInStore: { $sum: '$stock' } // Sum of quantity field in items collection
          }
        },
        {
          $project: {
            _id: 0,
            totalItemsInStore: 1
          }
        }
      ];

      const topSellersPipeline: PipelineStage[] = [
        { $match: matcher }, // Match any filters if needed
        {
          $group: {
            _id: '$soldByName', // Group by the seller's name
            count: { $sum: 1 } // Count how many times each seller appears
          }
        },
        { $sort: { count: -1 } }, // Sort by count in descending order
        { $limit: 2 }, // Limit to the top 2 sellers
        {
          $project: {
            _id: 0, // Exclude _id
            name: '$_id', // Rename _id to name
            count: 1 // Include the count
          }
        }
      ];

      const topSoldItemsPipeline: PipelineStage[] = [
        { $match: matcher },

        {
          $unwind: {
            path: '$items',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $group: {
            _id: '$items.itemId',
            name: { $first: '$items.itemName' },
            itemsSold: { $sum: '$items.quantity' }
          }
        },

        {
          $addFields: {
            itemIdAsObjectId: {
              $toObjectId: '$_id' // Convert the string itemId to ObjectId
            }
          }
        },

        {
          $lookup: {
            from: 'items', // The name of the items collection
            localField: 'itemIdAsObjectId', // Use the converted ObjectId
            foreignField: '_id', // The _id from the items collection
            as: 'itemData' // Alias for the joined data
          }
        },

        {
          $unwind: {
            path: '$itemData',
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $addFields: {
            itemsInStore: '$itemData.stock'
          }
        },

        {
          $project: {
            _id: 0,
            itemIdAsObjectId: 0,
            itemData: 0
          }
        },

        { $sort: { itemsSold: -1 } },

        { $limit: 5 }
      ];

      // Execute the pipeline
      const topSoldItemsResult = await transactionsModel.aggregate(
        topSoldItemsPipeline
      );

      // Execute all three pipelines
      const transactionsResult = await transactionsModel.aggregate(
        transactionsPipeline
      );
      const itemsResult = await itemsModel.aggregate(itemsPipeline);
      const topSellersResult = await transactionsModel.aggregate(
        topSellersPipeline
      );

      const { totalQuantitySold = 0, totalAmountSold = 0 } =
        transactionsResult[0] || {};
      const { totalItemsInStore = 0 } = itemsResult[0] || {};

      return {
        entityData: [
          { count: totalQuantitySold, type: 'total items sold' },
          { count: totalAmountSold, type: 'total amount' },
          { count: totalItemsInStore, type: 'total items in store' }
        ],
        countData: topSellersResult,
        topSoldItems: topSoldItemsResult
      };
    } catch (error) {
      throw new Error(`Error in analytics pipeline: ${error.message}`);
    }
  }
}
