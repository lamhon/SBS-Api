import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import Config from "src/configs/configs";
import messageText from "src/configs/message";
import { ResponseData } from "src/global/response.global";
import { Admins } from "src/modules/admins/entities/admins.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Admins) private readonly adminRepository: Repository<Admins>,
        private jwtService: JwtService
    ) { }

    public async findOne(
        username: string
    ): Promise<ResponseData<object>> {
        try {
            const findAdmin = await this.adminRepository.query(`
                SELECT id, username, pwd, fullname, avatar FROM login_admin('${username}')
            `)

            if (!findAdmin || findAdmin.length === 0) {
                return new ResponseData(
                    Config.RES_STT_FAILED,
                    {},
                    messageText.MESS_WRONG_LOGIN
                )
            }

            return new ResponseData(
                Config.RES_STT_SUCCESS,
                findAdmin[0],
                ''
            )
        } catch (err) {
            return new ResponseData(
                Config.RES_STT_FAILED,
                {},
                err.message
            )
        }
    }

    public async createAccessToken(
        id: string
    ): Promise<ResponseData<object>> {
        try {
            const payload = {
                id
            }

            const accessToken = await this.jwtService.signAsync(payload)
            console.log(accessToken)

            return new ResponseData(
                Config.RES_STT_SUCCESS,
                {
                    accessToken
                },
                ''
            )
        } catch (err) {
            return new ResponseData(
                Config.RES_STT_FAILED,
                {},
                err.message
            )
        }
    }

    public async getExpiration(
        token: string
    ): Promise<ResponseData<object>> {
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.ACCESS_TOKEN_SECRET
                }
            )

            // const test = await this.jwtService.
            // console.log(payload)
            console.log('iat at:', payload.iat)
            console.log('exp at:', payload.exp)

            return new ResponseData(
                Config.RES_STT_SUCCESS,
                payload.exp,
                ''
            )
        } catch (err) {
            return new ResponseData(
                Config.RES_STT_FAILED,
                {},
                err.message
            )
        }
    }
}