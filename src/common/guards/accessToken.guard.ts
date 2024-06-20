import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(
        private jwtService: JwtService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        console.log('request: ', request.headers)

        const token = this.extractTokenFromHeader(request)

        if (!token) {
            throw new UnauthorizedException()
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.ACCESS_TOKEN_SECRET
                }
            )

            request['user'] = payload
        } catch {
            throw new UnauthorizedException()
        }

        return true
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        // console.log(request.headers.authorization)
        const [type, token] = request.headers.authorization.split(' ') ?? []

        return type === 'Bearer' ? token : undefined
    }
}