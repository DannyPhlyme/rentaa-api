import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidPrice(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    const validatePrice = (price: string) => {
      if (isNaN(parseFloat(price)))
        throw new HttpException(
          'price is not a number',
          HttpStatus.BAD_REQUEST,
        );
      if (price.includes('.') && price.split('.')[1].length > 2)
        throw new HttpException(
          'price cannot be greater than 2 d.p',
          HttpStatus.BAD_REQUEST,
        );
      else return true;
    };
    registerDecorator({
      name: 'IsValidPrice',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(price: any) {
          if (!price) {
            throw new BadRequestException({
              message: 'No price provided',
              data: {
                status: 'You must provide a valid price',
              },
            });
          }
          return validatePrice(price);
        },
      },
    });
  };
}
