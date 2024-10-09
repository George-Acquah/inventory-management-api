// custom.d.ts
interface _ISafeUser {
  _id: string;
  email: string;
  isVerified: boolean;
}
declare namespace Express {
  interface Request {
    user: _ISafeUser; // Replace with your actual user type
  }
}
