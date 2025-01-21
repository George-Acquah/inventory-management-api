declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    CLIENT_PORT: string;
    FRONTEND_BASE_URL: string;
    NODE_ENV: 'development' | 'production' | 'staging';
    MONGODB_URI_DEV: string;
    SECRET_KEY: string;
    REFRESH_KEY: string;
    JWT_REFRESH: string;
    JWT_SIGN: string;
    JWT_LOCAL: string;
    ADMIN: string;
  }
}
