import { Request } from 'express';

//We extends the RequestType from express to create our custom Request interface for our file validations
//fileValidationError field is necessary because multer returns errors in that form
export interface _ICustomRequest extends Request {
  fileValidationError?: string;
}
