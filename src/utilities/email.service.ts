import { Injectable } from '@nestjs/common';
import axios from 'axios';
// import * as fs from 'fs';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { SendEmailDto } from 'src/modules/auth/dto/email';
// import * as nunjucks from 'nunjucks';

// const env = new nunjucks.Environment(
//   new nunjucks.FileSystemLoader(path.resolve(__dirname, '../../../templates'), {
//     noCache: true, // remove in production
//   }),
// );

@Injectable()
export class EmailService {
  /**
   * Render email to html from template file
   */
  // renderEmailTemplate(templateName: string, data: any) {
  //   const template = env.render(`${templateName}.html`, data);
  //   return template;
  // }

  /**
   * Mail a user (SendGrid)
   *
   * @param payload
   * @returns
   */
  // async mailUser(payload: {
  //   to: string;
  //   subject: string;
  //   emailData: Record<string, any>;
  //   emailTemplate: string;
  // }) {
  //   const html = this.renderEmailTemplate(
  //     payload.emailTemplate,
  //     payload.emailData,
  //   );

  //   const ses = new AWS.SES({ apiVersion: '2010-12-01' });
  //   const params = {
  //     Destination: {
  //       ToAddresses: [payload.to],
  //     },
  //     Message: {
  //       Body: {
  //         Html: {
  //           Charset: 'UTF-8',
  //           Data: html,
  //         },
  //       },
  //       Subject: {
  //         Charset: 'UTF-8',
  //         Data: payload.subject,
  //       },
  //     },
  //     Source: `${config.general.appName} <${config.general.mailSender}>`,
  //   };
  //   return await ses.sendEmail(params).promise();
  // }

  /**
   * Mail a user (Elastic Email)
   */
  public async sendMail(payload: SendEmailDto): Promise<void> {
    try {
      const axiosInstance = axios.create({
        baseURL: process.env.ELASTIC_EMAIL_URL,
        params: {
          apiKey: process.env.ELASTIC_EMAIL_API_KEY,
        },
      });
      await axiosInstance.post(
        '/email/send',
        {},
        {
          params: payload.data,
        },
      );
    } catch (error: any) {}
  }

  /**
   * Add user to aweber list
   */
  public async addToAweber(payload): Promise<void> {
    const tokenUrl = 'https://auth.aweber.com/oauth2/token';
    const clientId = process.env.AWEBER_CLIENT_ID;
    const url =
      'https://api.aweber.com/1.0/accounts/1777664/lists/6064064/subscribers';
    const token = this.readToken()['token'];
    const extra = {
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: token['refresh_token'],
    };
    const axiosInstance = axios.create({
      params: {
        client_id: clientId,
        token: token,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'AWeber-NodeJs-code-sample/1.0',
        Authorization: 'Bearer ' + token['access_token'],
      },
    });
    try {
      await axiosInstance.post(url, payload, {});
    } catch (error) {
      if (error.response.status == 401) {
        // if status code is 401
        try {
          const response = await axios.post(tokenUrl, extra, {}); // get new access token
          const newToken = {
            token: response.data,
          };
          this.updateToken(newToken);
          await axios.post(url, payload, {
            params: {
              client_id: clientId,
              token: token,
            },
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'User-Agent': 'AWeber-NodeJS-code-sample/1.0',
              Authorization:
                'Bearer ' + this.readToken()['token']['access_token'],
            },
          });
        } catch (error: any) {}
      }
    }
  }

  /**
   * Reads token from the file
   */
  private readToken() {
    return JSON.parse(readFileSync('credentials.json', 'utf-8').toString());
  }

  /**
   * Updates the token in the json file
   */
  private updateToken(token: any) {
    writeFileSync('credentials.json', JSON.stringify(token));
  }
}
