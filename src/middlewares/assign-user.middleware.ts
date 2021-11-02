import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 跟 req 绑定 user 的中间件.
 * 一般通过 token 获取用户信息
 */
@Injectable()
export class AssignRequestMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        const token = req.header('Authorization');
        (<any>req).user = await getUserByToken(token);
        next();
    }
}

function getUserByToken(token: string) {
    if (token) return { roles: ['admin'] }
    return { roles: ['user'] }
}

