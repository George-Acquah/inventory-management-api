import { JwtPayload } from 'jsonwebtoken';

//We define our interface for our JWT payload
//Basically, JWT will sign this payload and return a token to us
interface _IPayload {
  user_id: string;
  sub: {
    email: string;
  };
}

type _TJwtPayload = JwtPayload & _IPayload;

interface _IReservationPayload {
  slot_id: string;
  vehicle_id: string;
  sub: {
    reservation_id: string;
  };
}

interface _IReservationsPayloadRequest {
  slot_id: string;
  vehicle_id: string;
  reservation_id: string;
}

interface _ITokens {
  access_token: string;
  refresh_token: string;
  expiresIn: number;
}

export {
  _IPayload,
  _IReservationPayload,
  _ITokens,
  _IReservationsPayloadRequest,
  _TJwtPayload
};
