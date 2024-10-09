/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';

/**
 * Custom decorator to check if a string is non-empty.
 *
 * @param {ValidationOptions} [validationOptions] - Optional validation options to customize the error message and context.
 * @returns {PropertyDecorator} - A property decorator to be applied to class properties.
 */
export function IsNonEmptyString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNonEmptyString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        /**
         * Validation logic for non-empty string.
         *
         * @param {any} value - The value to validate.
         * @param {ValidationArguments} args - Arguments providing additional context for the validation.
         * @returns {boolean} - Returns true if the value is a non-empty string, false otherwise.
         */
        validate(value: any, args: ValidationArguments) {
          // Check if the value is a string and not empty (whitespace only strings are also considered empty)
          return typeof value === 'string' && value.trim().length > 0;
        },
        /**
         * Default error message if the string is empty.
         *
         * @param {ValidationArguments} args - Arguments providing additional context for the validation.
         * @returns {string} - The error message to be displayed.
         */
        defaultMessage(args: ValidationArguments) {
          return `The property '${args.property}' must be a non-empty string.`;
        }
      }
    });
  };
}
