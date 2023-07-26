import {
  Inject,
  NestMiddleware,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/users/user.repository';
import { NextFunction } from 'express';
import { decodeAuthToken } from '../utils/token.generators';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(UserRepository) private readonly userReposity: UserRepository,
  ) {}

  async use(req: Request | any, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.token;

      if (!token) {
        throw new UnauthorizedException('No token found');
      }

      const decoded: any = decodeAuthToken(token);
      const user = await this.userReposity.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }

      user.password = undefined;
      req.user = user;

      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
