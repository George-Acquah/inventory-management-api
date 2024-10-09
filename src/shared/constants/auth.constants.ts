const strategies = {
  REFRESH: process.env.JWT_REFRESH,
  JWT: process.env.JWT_SIGN,
  LOCAL: process.env.JWT_LOCAL,
  RESERVATION: process.env.JWT_RESERVATION,
  VEHICLE: process.env.JWT_VEHICLE,
  PARKING_CENTER: process.env.JWT_CENTER,
  OWNER: process.env.JWT_CENTER
};

export { strategies };
