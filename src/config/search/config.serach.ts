import { readFileSync } from 'fs';

export class ConfigSearch {
  public static searchConfig(
    url: string,
    username: string,
    password: string,
  ): any {
    return {
      node: url,
      auth: {
        username,
        password,
      },
      ssl: {
        // ca: readFileSync('./ca.crt'),
        rejectUnauthorized: false,
      },
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true,
    };
  }
}
