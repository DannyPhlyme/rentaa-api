import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { extname } from 'path';

const fileFilter = (req: any, photo: Express.Multer.File, cb) => {
  if (photo.mimetype.match(/\/(jpg|jpeg)$/)) cb(null, true);
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
