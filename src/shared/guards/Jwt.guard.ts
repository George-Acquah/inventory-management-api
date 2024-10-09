import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { strategies } from '../constants/auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(strategies.JWT) {}
