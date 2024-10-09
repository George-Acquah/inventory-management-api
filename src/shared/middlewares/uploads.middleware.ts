import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as multer from 'multer';
import { _ICustomRequest } from '../interfaces/custom-request.interface';

@Injectable()
export class UploadMiddleware implements NestMiddleware {
  private readonly storage = multer.memoryStorage(); // Use memory storage

  private readonly allowedFiles = (
    req: _ICustomRequest,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void
  ): void => {
    // Define the allowed file extensions
    const allowedExtensions = /\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|pdf|PDF)$/;

    // Check if the file's originalname matches allowed extensions
    if (!file.originalname.match(allowedExtensions)) {
      req.fileValidationError = 'Only image and PDF files are allowed!';
      cb(new Error('Only image and PDF files are allowed!'), false);
      return; // Return immediately when an invalid file is found
    }

    cb(null, true); // Call the callback after processing the file
  };

  public use(req: _ICustomRequest, res: Response, next: NextFunction): any {
    const upload = multer({
      storage: this.storage,
      fileFilter: this.allowedFiles
    }).array('files', 5); // Use .array to accept multiple files with the field name 'files'

    upload(req, res, function (err: any) {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ error: 'Multer error: ' + err.message });
      } else if (err) {
        res
          .status(500)
          .json({ error: 'Error uploading the file: ' + err.message });
      } else {
        // At this point, req.files will contain an array of files as buffers
        next();
      }
    });
  }
}
