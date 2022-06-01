enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum TokenReason {
  REFRESH_TOKEN = 'refresh-token',
  VERIFY_EMAIL = 'verify-email',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
}

enum GadgetCondition {
  BRAND_NEW = 'new',
  FAIRLY_USED = 'used',
}

enum GadgetStatus {
  UNAVAILABLE = 'unavailable',
  AVAILABLE = 'available',
  RENTED_OUT = 'rented out',
}

enum ImageType {
  JPEG = 'jpeg',
  PNG = 'png',
}

const emailTemplate = (
  emailName: string,
  recipient: string,
  token?: string,
  first_name?: string,
) => {
  switch (emailName) {
    case 'registerEmail':
      return {
        msgTo: recipient,
        template: '3624',
      };
    case 'verificationEmail':
      return {
        msgTo: recipient,
        template: '3048',
        token,
      };
    case 'forgotPassword':
      return {
        msgTo: recipient,
        template: 3698,
      };
    case 'referralRegistered':
      return {
        msgTo: recipient,
        template: '3779',
      };
    case 'resetPassword':
      return {
        msgTo: recipient,
        template: 3731,
      };
    case 'rentaa-verify':
      return {
        msgTo: recipient,
        template: 15279,
        // first_name,
        // token,
      };
    default:
      return '';
  }
};

export {
  Status,
  TokenReason,
  ImageType,
  GadgetCondition,
  GadgetStatus,
  emailTemplate,
};
