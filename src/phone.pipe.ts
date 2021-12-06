import { Transform } from 'class-transformer';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const validCountries = ['NG'];

export const ToPhone = Transform(
  (value: any) => {
    if (typeof value !== 'string') return undefined;

    const parsed = parsePhoneNumberFromString(value);

    if (!parsed) return undefined;
    if (!validCountries.includes(parsed.country)) return undefined;

    return parsed.number;
  },
  { toClassOnly: true },
);
