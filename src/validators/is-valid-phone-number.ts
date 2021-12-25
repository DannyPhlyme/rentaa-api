import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsValidPhoneNumber(validationOptions: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidPhoneNumber',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(phonenumber: string) {
          if (!phonenumber) {
            return false;
          }
          if (phonenumber.includes('+')) {
            return phonenumber.search(/^\+[0-9]{10,15}$/g) !== -1;
          } else {
            return phonenumber.search(/^[0-9]{10,15}$/g) !== -1;
          }
        },
      },
    });
  };
}
