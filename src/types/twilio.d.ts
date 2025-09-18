declare module 'twilio' {
  interface TwilioError extends Error {
    code?: number;
    moreInfo?: string;
    status?: number;
  }

  interface MessageInstance {
    sid: string;
    status: string;
    body: string;
    from: string;
    to: string;
    dateCreated: Date;
    dateUpdated: Date;
    dateSent?: Date;
    errorCode?: number;
    errorMessage?: string;
    price?: string;
    priceUnit?: string;
    direction?: string;
    numSegments?: string;
    numMedia?: string;
  }

  interface MessageListInstance {
    create(options: {
      body: string;
      from: string;
      to: string;
      messagingServiceSid?: string;
      statusCallback?: string;
      maxPrice?: number;
      provideFeedback?: boolean;
      validityPeriod?: number;
      smartEncoded?: boolean;
      persistentAction?: string[];
      shortenUrls?: boolean;
      scheduleType?: string;
      sendAt?: Date;
      sendAsMms?: boolean;
    }): Promise<MessageInstance>;
  }

  interface TwilioClient {
    messages: MessageListInstance;
    account: any;
    api: any;
  }

  function twilio(accountSid: string, authToken: string): TwilioClient;

  export = twilio;
  export as namespace twilio;
}
