import { ConflictException, Injectable } from '@nestjs/common';
import mongoose, {
  Model,
  Document,
  FilterQuery,
  PipelineStage,
  AnyExpression
} from 'mongoose';
import { _ILookup } from '../interfaces/responses.interface';

@Injectable()
export class AggregationService {
  // constructor() {}

  /**
   * Creates a new document, ensures its uniqueness, and retrieves it with specified fields.
   *
   * @template T - The type representing the schema of the documents.
   * @template S - The type representing the sanitized return type.
   *
   * @param {Model<T>} model - Mongoose model representing the collection.
   * - The Mongoose model to interact with the database collection.
   *
   * @param {string[]} projectFields - List of fields to include in the final result. Only these fields will be projected.
   * - Specify the fields to include in the returned document.
   *
   * @param {Partial<T>} data - The data to create the new document with. This is the payload for the new document.
   * - The content of the new document being created.
   *
   * @param {Partial<Record<keyof T, any>>} uniqueFields - Criteria to check for the uniqueness of the document. Ensures no duplicate documents exist.
   * - Define the fields that must be unique for the new document.
   *
   * @param {string[]} errHelper - Array containing error message details. The first element is for uniqueness conflict, the second for general error.
   * - Error message templates for conflict and general errors.
   *
   * @param {(doc: T) => S} [sanitizeFn] - Optional function to sanitize or transform the document before returning.
   * - Function to process or sanitize the document before returning it.
   *
   * @returns {Promise<S>} - Returns a promise that resolves to the created and sanitized document.
   * - The final processed document.
   *
   * @throws {ConflictException} - Throws an error if a document with the specified unique fields already exists.
   * - Throws an error if a document with the same unique fields already exists.
   *
   * @throws {Error} - Throws an error if there's an issue during the document creation or projection process.
   * - General error for issues during creation or fetching of the document.
   */
  async createDocumentPipeline<T extends Document, S>(
    model: Model<T>,
    projectFields: string[],
    data: Partial<T>,
    uniqueFields: Partial<Record<keyof T, any>>,
    errHelper: string[],
    sanitizeFn?: (doc: T) => S
  ): Promise<S> {
    try {
      // Check for existing document
      const existingDoc = await model.findOne(uniqueFields);
      if (existingDoc) {
        throw new ConflictException(`${errHelper[0]} already exists`);
      }

      // Create new document
      const newDoc = new model(data);
      await newDoc.save();

      // Build the projection object
      const project = projectFields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

      // Build the pipeline to match the new document by its ID and project only the specified fields
      const pipeline = await model.aggregate([
        { $match: { _id: newDoc._id } },
        { $project: project }
      ]);

      if (sanitizeFn) {
        // Sanitize and return the document
        return sanitizeFn(pipeline[0]);
      }
      return pipeline[0];
    } catch (error) {
      throw new Error(`Error creating ${errHelper[1]}: ${error.message}`);
    }
  }

  /**
   * Fetches documents from the collection based on search criteria and pagination,
   * with optional population of related documents.
   *
   * @template T - The type representing the schema of the documents.
   *
   * @param {Model<T>} model - Mongoose model representing the collection.
   * // ** ssoss ** - The Mongoose model to interact with the database collection.
   *
   * @param {string[]} fieldNames - List of field names to search within. Each field will be searched using the provided query.
   * // ** ssoss ** - Array of field names where the query string will be searched.
   *
   * @param {string} query - The search string to match against the specified fields.
   * // ** ssoss ** - The query string to search for in the specified fields.
   *
   * @param {number} currentPage - The current page number for pagination. Used to calculate the offset.
   * // ** ssoss ** - The page number to fetch results for. Used to calculate the skip offset.
   *
   * @param {number} items - Number of items per page. This value is used to limit the number of documents returned.
   * // ** ssoss ** - Number of items to display per page.
   *
   * @param {string} [populatePath] - Path to populate for related documents. Optional parameter.
   * // ** ssoss ** - The path to populate related documents from, if any.
   *
   * @param {number} [populateLimit] - Limit for the number of populated documents. Optional parameter.
   * // ** ssoss ** - The limit on the number of documents to populate in the related path.
   *
   * @returns {Promise<T[]>} - Returns a promise that resolves to an array of the matched documents.
   * // ** ssoss ** - The array of documents that match the criteria, paginated and optionally populated.
   *
   * @throws {Error} - Throws an error if there is an issue during the document fetching process.
   * // ** ssoss ** - Throws an error if the document retrieval or population encounters an issue.
   */
  async fetchFilteredDocuments<T extends Document>(
    model: Model<T>,
    fieldNames: string[],
    query: string,
    currentPage: number,
    items: number,
    populatePath?: string,
    populateLimit?: number
  ): Promise<T[]> {
    // Calculate the offset for pagination based on the current page and items per page
    const offset = (currentPage - 1) * items;

    try {
      // Construct search conditions for each specified field using the query string
      const simpleConditions = fieldNames.map((field) => ({
        [field]: { $regex: query, $options: 'i' } // Case-insensitive regex search
      }));

      // Combine the conditions using the $or operator to match documents with the query in any of the fields
      const conditions = {
        $or: simpleConditions
      } as unknown as FilterQuery<T>[];

      // Fetch documents from the collection using the constructed conditions
      const documents = await model
        .find(conditions) // Apply the combined search conditions
        .skip(offset) // Skip documents for pagination based on the calculated offset
        .limit(items) // Limit the number of documents returned to the specified items per page
        // Conditionally apply population if both populatePath and populateLimit are provided
        .populate(
          populatePath && populateLimit
            ? {
                path: populatePath, // The path to populate related documents from
                strictPopulate: false, // Option to disable strict population
                options: { limit: populateLimit } // Limit the number of documents to populate
              }
            : undefined // No population if populatePath or populateLimit is not provided
        )
        .exec(); // Execute the query

      return documents; // Return the array of matched documents
    } catch (error) {
      // Provide a detailed error message and rethrow the error
      throw new Error(`Error fetching filtered documents: ${error.message}`);
    }
  }

  /**
   * Calculates the total number of pages needed to display documents based on search criteria and pagination.
   *
   * @template T - The type representing the schema of the documents.
   *
   * @param {Model<T>} model - Mongoose model representing the collection.
   * - The Mongoose model to interact with the database collection.
   *
   * @param {string[]} fieldNames - List of field names to search within. Each field will be searched using the provided query.
   * - Array of field names where the query string will be searched.
   *
   * @param {string} [query=''] - The search string to match against the specified fields. Defaults to an empty string if not provided.
   * - The query string to search for in the specified fields. Defaults to an empty string.
   *
   * @param {number} items - Number of items per page. This value is used to calculate the total number of pages.
   * - Number of items to display per page.
   *
   * @param {object} [options] - Additional options to apply to the query, such as other filtering conditions. Optional parameter.
   * - Additional query options to refine the search, such as extra filtering conditions.
   *
   * @returns {Promise<number>} - Returns a promise that resolves to the total number of pages required to display the results.
   * - The total number of pages calculated based on the query and items per page.
   *
   * @throws {Error} - Throws an error if there is an issue during the count calculation process.
   * - Throws an error if the document count or page calculation encounters an issue.
   */
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

  /**
   * Retrieves the `_id` of a document based on an identifier, which can be either the document's `_id` or `email`.
   *
   * @template T - The type representing the schema of the documents.
   *
   * @param {Model<T>} model - Mongoose model representing the collection.
   * - The Mongoose model to interact with the database collection.
   *
   * @param {string} identifier - The identifier to match the document by, can be either an `_id` or an `email`.
   * - An identifier used to find the document, either its `_id` or its email.
   *
   * @returns {Promise<string | null>} - Returns a promise that resolves to the `_id` of the matched document as a string or null if no document is found.
   * - The `_id` of the matched document, or null if no document matches.
   *
   * @throws {Error} - Throws an error if there is an issue during the aggregation process.
   * - Throws an error if the aggregation process encounters an issue.
   */
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
              { _id: new mongoose.Types.ObjectId(identifier) }, // Match by _id
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
      ])) as Array<{ _id: mongoose.Types.ObjectId }> | []; // Ensure type casting for returned pipeline results

      // Check if a document was found and return its _id as a string
      return pipeline.length > 0 ? pipeline[0]._id.toString() : null;
    } catch (error) {
      console.error('Error in returnIdPipeline:', error);
      throw error; // Rethrow the error
    }
  }

  /**
   * Fetches a document from the collection using specified matching criteria and projects only the specified fields.
   *
   * @template T - The type representing the schema of the documents.
   * @template S - The type representing the return type after projection.
   *
   * @param {Model<T>} model - Mongoose model representing the collection.
   * - The Mongoose model to interact with the database collection.
   *
   * @param {string[]} projectFields - List of fields to include in the final result. Only these fields will be projected.
   * - Specify the fields to include in the returned document.
   *
   * @param {Partial<Record<keyof T, any>>} matcher - Criteria to filter the documents. This object specifies the matching conditions.
   * - Define the conditions to match documents against.
   *
   * @param {string} errHelper - A string to provide context for the error message if an error occurs during the fetching process.
   * - Context for error messages, often indicating the type of document or operation that failed.
   *
   * @returns {Promise<S>} - Returns a promise that resolves to the projected document.
   * - The document that matches the criteria, projected with the specified fields.
   *
   * @throws {Error} - Throws an error if there is an issue during the aggregation process.
   * - Throws an error if the document retrieval or projection encounters an issue.
   */
  async fetchDocumentPipeline<T extends Document, S>(
    model: Model<T>,
    projectFields: string[],
    matcher: Partial<Record<keyof T, any>>,
    errHelper: string
  ): Promise<S> {
    try {
      // Build the projection object
      const project = projectFields.reduce((acc, field) => {
        acc[field] = 1; // Include the specified field in the result
        return acc;
      }, {});

      // Build the aggregation pipeline
      const pipeline = await model.aggregate([
        { $match: { ...matcher } }, // Match documents based on the provided criteria
        { $project: project } // Project only the specified fields
      ]);

      // Return the first document that matches the criteria
      return pipeline[0] as S;
    } catch (error) {
      // Provide detailed error context and rethrow the error
      throw new Error(`Error fetching ${errHelper}: ${error.message}`);
    }
  }

  /**
   * A dynamic MongoDB aggregation pipeline generator and executor.
   * This function allows fetching, projecting, and processing documents with optional lookup, unwind, and pagination capabilities.
   *
   * @template T - The type representing the schema of the documents.
   * @template S - The type representing the return type.
   *
   * @param {Model<T>} model - Mongoose model representing the collection.
   *
   * @param {boolean} return_as_object - Flag indicating whether to return a single object or an array of documents.
   *
   * @param {(keyof T)[]} project_fields - List of fields to include in the projection. These fields will be included in the result.
   * - Specify the document fields that should be included in the output.
   *
   * @param {Partial<Record<keyof T, any>>} matcher - Criteria to filter the documents. This object specifies the matching conditions.
   * - Define the conditions to match documents against.
   *
   * @param {_ILookup[]} [lookup_data] - Optional array of lookup specifications to join documents from other collections.
   * - Define relationships to other collections for joining additional data.
   *
   * @param {(keyof T)[]} [unwind_fields] - Optional list of fields to unwind. Unwinds each specified array field into separate documents.
   * - Specify fields that are arrays to unwind them into individual documents.
   *
   * @param {string[]} [countFields] - Optional array of fields for which counts should be included. The count will be added as `<field>_count`.
   * - Add a count of the elements in the specified array fields.
   *
   * @param {number} [currentPage=1] - The current page number for pagination. Must be a positive integer.
   * - The page of results to fetch, used for pagination.
   *
   * @param {number} [items=10] - Number of items to return per page. Must be a positive integer.
   * - The number of documents to return per page, used for pagination.
   *
   * @param {(doc: T) => AnyExpression} [sanitizeFn] - Optional function to sanitize or transform each document before returning.
   * - Function to process or sanitize documents before they are returned.
   *
   * @returns {Promise<S>} - Returns a promise that resolves to the transformed documents or a single document, depending on `return_as_object`.
   *
   * @throws {Error} - Throws an error if the `currentPage` or `items` parameters are less than 1 or if there is an issue during aggregation.
   */
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
}
