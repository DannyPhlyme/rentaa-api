/**
 * Represents the form that a Gadget Photo request data takes. Does not map
 * to the database directly.
 *
 * @class
 */

export class CreatePhotoDto {
  originalname: string;

  encoding: string;

  mimetype: string;

  buffer: Buffer;

  size: number;

  cover: boolean;

  bucketname: string;

  key: string;
}
