// import { Injectable } from '@nestjs/common';

export class Formatter {
  public static append_ng_country_code(phonenumber: string) {
    if (phonenumber.includes('+234')) {
      return phonenumber;
    }
    return phonenumber[0] === '0'
      ? `+234${phonenumber.slice(1)}`
      : `+234${phonenumber}`;
  }

  public static calculate_days(days: any) {
    const date = new Date();
    const last = new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    return last;
  }

  public static calculate_minutes(minutes) {
    const date = new Date();
    const last = new Date(date.getTime() + minutes * 60 * 1000);
    return last;
  }
}
