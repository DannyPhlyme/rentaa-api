import { MinLength, MaxLength } from 'class-validator';

/**
 * Represents the form that Review request data takes. Does not map
 * to the database directly.
 *
 * @class
 */
export class CreateReviewDto {
  @MinLength(3, {
    message: 'Please provide a valid reviewer name',
  })
  reviewer: string;

  @MaxLength(1000, {
    message: 'Review has to be a maximum length of 1000 characters',
  })
  review: string;

  //   @IsUUID('all', {
  //     message: 'Please provide a valid user ID',
  //   })
  //   revieweeId: string; // this can also be extracted from the query string
}
