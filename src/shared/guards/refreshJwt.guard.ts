import { AuthGuard } from '@nestjs/passport';
import { strategies } from '../constants/auth.constants';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard(strategies.REFRESH) {}
