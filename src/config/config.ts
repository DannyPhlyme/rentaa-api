import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

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

const storage = diskStorage({
  destination: 'public/uploads',
  filename: (req: any, photo: Express.Multer.File, cb) => {
    cb(null, `${uuid()}${extname(photo.originalname)}`);
  },
});

export const multerOptions: MulterOptions = {
  fileFilter,
  storage,
  limits: {
    fileSize: 2000000,
  },
};
