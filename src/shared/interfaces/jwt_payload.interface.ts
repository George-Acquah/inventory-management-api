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

interface _ITokens {
  access_token: string;
  refresh_token: string;
  expiresIn: number;
}

export { _IPayload, _ITokens, _TJwtPayload };
