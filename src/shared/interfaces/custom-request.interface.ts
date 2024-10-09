import { Request } from 'express';
import { _IReservationsPayloadRequest } from './jwt_payload.interface';

//We extends the RequestType from express to create our custom Request interface for our file validations
//fileValidationError field is necessary because multer returns errors in that form
export interface _ICustomRequest extends Request {
  fileValidationError?: string;
}

export type _TRequestWithAuth = Request & _IReservationsPayloadRequest;
