import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as multer from 'multer';
import { _ICustomRequest } from '../interfaces/custom-request.interface';

@Injectable()
export class UploadMiddleware implements NestMiddleware {
  private readonly storage = multer.memoryStorage();

  private readonly allowedFiles = (
    req: _ICustomRequest,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void
  ): void => {
    const allowedExtensions = /\.(jpg|jpeg|png|gif|pdf)$/i; // Allowed file types

    if (!file.originalname.match(allowedExtensions)) {
      req.fileValidationError = 'Only image and PDF files are allowed!';
      cb(new Error('Only image and PDF files are allowed!'), false);
      return;
    }
    cb(null, true); // Accept file
  };

  public use(req: _ICustomRequest, res: Response, next: NextFunction): any {
    const upload = multer({
      storage: this.storage, // Now using memory storage
      fileFilter: this.allowedFiles,
      limits: { fileSize: 2000 * 1024 } // Optional: Add file size limit (e.g., 2MB)
    }).array('files', 5); // Accept up to 5 files

    upload(req, res, function (err: any) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'Multer error: ' + err.message });
      } else if (err) {
        return res
          .status(500)
          .json({ error: 'Error uploading the file: ' + err.message });
      }
      next();
    });
  }
}
