// import { readFileSync } from 'fs';

export class ConfigSearch {
  public static searchConfig(url: string, username: string, password: string): any {
    return {
      node: url,
      // auth: {
      //   username: 'elastic',
      //   password: 'changeme',
      // },
      // tls: {
      //   // ca: readFileSync('./http_ca.crt'),
      //   rejectUnauthorized: false
      // },
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true,
    };
  }
}
