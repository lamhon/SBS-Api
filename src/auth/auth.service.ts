import { Injectable, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import Config from "src/configs/configs";
import messageText from "src/configs/message";
import { ResponseData } from "src/global/response.global";
import { Admins } from "src/modules/admins/entities/admins.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { SigninAdminDto } from "src/modules/admins/dto/signin-admin.dto";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Admins) private readonly adminRepository: Repository<Admins>,
        private jwtService: JwtService,
        private configService: ConfigService
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

    public async clearRefreshTokenDb(
        id: string
    ): Promise<ResponseData<object>> {
        try {
            const update = await this.adminRepository.query(`
                    UPDATE admins
                    SET refresh_token = null
                    WHERE id = '${id}' AND delete_type = '${Config.TYPE_ACTIVE}'
                `)

            if (update[1] === 0) {
                return new ResponseData(
                    Config.RES_STT_FAILED,
                    {},
                    messageText.MESS_WRONG_USERID
                )
            }
            return new ResponseData(
                Config.RES_STT_SUCCESS,
                {},
                ''
            )
            // console.log('update:', update[1])
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

            const accessToken = await this.jwtService.signAsync(
                payload,
                {
                    secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
                    expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES'),
                }
            )

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

    public async createRefreshToken(
        id: string
    ): Promise<ResponseData<object>> {
        try {
            const payload = {
                id
            }

            const refreshToken = await this.jwtService.signAsync(
                payload,
                {
                    secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
                    expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES')
                }
            )

            return new ResponseData(
                Config.RES_STT_SUCCESS,
                {
                    refreshToken
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

    public async updateRefreshToken(
        id: string,
        refreshToken: string
    ): Promise<ResponseData<object>> {
        try {
            const hashedRefreshToken = await bcrypt.hashSync(refreshToken, 10)

            // const test = await this.refreshToken(id, '')

            const updateTokenToDB = await this.update(id, hashedRefreshToken)

            if (!updateTokenToDB) {
                return new ResponseData(
                    Config.RES_STT_FAILED,
                    {},
                    ''
                )
            }

            return new ResponseData(
                Config.RES_STT_SUCCESS,
                {},
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

    public async confirmToken(
        id: string,
        refreshToken: string
    ): Promise<ResponseData<object>> {
        try {
            // const getAdmin = await this.adminRepository.query('SELECT refresh_token FROM admins LIMIT 1')

            const getAdmin = await this.adminRepository.findBy({
                id
            })

            if (!getAdmin[0] || !getAdmin[0].refresh_token) {
                return new ResponseData(
                    Config.RES_STT_FAILED,
                    {},
                    ''
                )
            }

            const checkRefreshToken = await bcrypt.compareSync(refreshToken, getAdmin[0].refresh_token)

            if (!checkRefreshToken) {
                return new ResponseData(
                    Config.RES_STT_FAILED,
                    {},
                    ''
                )
            }

            const getAccessToken = await this.createAccessToken(id)
            if (getAccessToken.status !== Config.RES_STT_SUCCESS) {
                return new ResponseData(
                    Config.RES_STT_FAILED,
                    {},
                    messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_GENERATE_ACCESSTOKEN)
                )
            }

            const getRefreshToken = await this.createRefreshToken(id)
            if (getRefreshToken.status !== Config.RES_STT_SUCCESS) {
                return new ResponseData(
                    Config.RES_STT_FAILED,
                    {},
                    messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_GENERATE_REFRESHTOKEN)
                )
            }

            const updateToken = await this.updateRefreshToken(
                id,
                getRefreshToken.data['refreshToken']
            )

            if (updateToken.status !== Config.RES_STT_SUCCESS) {
                return new ResponseData(
                    Config.RES_STT_FAILED,
                    {},
                    messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_UPDATE_REFRESHTOKEN_TO_DB)
                )
            }

            return new ResponseData(
                Config.RES_STT_SUCCESS,
                {
                    accessToken: getAccessToken.data['accessToken'],
                    refreshToken: getRefreshToken.data['refreshToken']
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
        token: string,
        secret: string
    ): Promise<ResponseData<object>> {
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret
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

    private async update(
        id: string,
        refreshToken: string
    ): Promise<boolean> {
        try {
            await this.adminRepository.update({
                id
            }, {
                refresh_token: refreshToken
            })

            return true
        } catch (err) {
            return false
        }
    }
}