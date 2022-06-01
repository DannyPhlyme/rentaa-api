import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { extname } from 'path';

const fileFilter = (req: any, photo: Express.Multer.File, cb) => {
  if (photo.mimetype.match(/\/(jpg|jpeg|png)$/)) cb(null, true);
  else
    cb(
      new HttpException(
        `unsupported file type ${extname(photo.originalname)}`,
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
};

export const multerOptions: MulterOptions = {
  fileFilter,
  limits: {
    fileSize: 2000000,
  },
};

export const DEFAULT_UUID = '2ef1d608-8afd-428d-a732-b7ee93ce1711';
