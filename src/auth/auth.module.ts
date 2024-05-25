import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AdminsModule } from "src/modules/admins/admins.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admins } from "src/modules/admins/entities/admins.entity";

@Module({
    imports: [
        AdminsModule,
        TypeOrmModule.forFeature([Admins]),
        JwtModule.register({
            global: true,
            secret: process.env.ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: '10m'
            }
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService]
})

export class AuthModule { }