const strategies = {
  REFRESH: process.env.JWT_REFRESH,
  JWT: process.env.JWT_SIGN,
  LOCAL: process.env.JWT_LOCAL,
  ADMIN: process.env.ADMIN
};

export { strategies };
