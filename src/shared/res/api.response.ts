/**
 * ApiResponse Class
 *
 * This generic class is used to standardize API responses throughout the application.
 * It encapsulates the HTTP status code, a message, and any data returned from API endpoints.
 *
 * @template T - The type of the data to be included in the response.
 *
 * Example Usage:
 *
 * In a controller method, you can use the ApiResponse class to format responses:
 *
 * @example
 * import { Controller, Get } from '@nestjs/common';
 * import { ApiResponse } from '@shared/res/api.rsponse'; // Adjust the path as necessary
 *
 * @Controller('example')
 * export class ExampleController {
 *   @Get()
 *   getExample(): ApiResponse<string> {
 *     // Return a standardized response
 *     return new ApiResponse(200, 'Request successful', 'This is example data');
 *   }
 * }
 *
 * In a service or any other part of your application, you can create and return standardized responses:
 *
 * @example
 * import { Injectable } from '@nestjs/common';
 * import { ApiResponse } from '@shared/res/api.rsponse'; // Adjust the path as necessary
 *
 * @Injectable()
 * export class ExampleService {
 *   getExampleData(): ApiResponse<{ id: number, value: string }> {
 *     // Return a standardized response with data
 *     const data = { id: 1, value: 'Sample Data' };
 *     return new ApiResponse(200, 'Data retrieval successful', data);
 *   }
 * }
 */
class ApiResponse<T> {
  constructor(
    /**
     * The HTTP status code of the response.
     */
    public statusCode: number,

    /**
     * A descriptive message about the response.
     */
    public message: string,

    /**
     * The actual data being returned in the response, of type T.
     */
    public data: T
  ) {}
}

export { ApiResponse };
