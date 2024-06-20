import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import Config from "src/configs/configs";
import { ResponseData } from "src/global/response.global";
import { SigninAdminDto } from "src/modules/admins/dto/signin-admin.dto";
import { AuthService } from "./auth.service";
import messageText from "src/configs/message";
import * as bcrypt from "bcrypt";
import { AccessTokenGuard } from "src/common/guards/accessToken.guard";
import { RefreshTokenGuard } from "src/common/guards/refreshToken.guard";

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('signin')
    public async signin(
        @Body() signinAdminDto: SigninAdminDto,
        @Res() res: Response
    ): Promise<Response> {
        try {
            const findOne = await this.authService.findOne(signinAdminDto.username)

            if (findOne.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_BAD_RQ).send(
                    new ResponseData(
                        findOne.status || Config.RES_STT_FAILED,
                        {},
                        findOne.message || messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_QUERY_FAILED)
                    )
                )
            }

            const checkPwd = bcrypt.compareSync(signinAdminDto.pwd, findOne.data['pwd'])

            if (!checkPwd) {
                return res.status(Config.RES_CODE_ERR_UNAUTHORIZED).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        messageText.MESS_WRONG_LOGIN
                    )
                )
            }

            delete findOne.data['pwd']

            const generateAcessToken = await this.authService.createAccessToken(
                findOne.data['id']
            )

            if (generateAcessToken.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_GENERATE_ACCESSTOKEN)
                    )
                )
            }

            const generateRefreshToken = await this.authService.createRefreshToken(
                findOne.data['id']
            )

            if (generateRefreshToken.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_GENERATE_REFRESHTOKEN)
                    )
                )
            }

            const updateRefreshToken = await this.authService.updateRefreshToken(
                findOne.data['id'],
                generateRefreshToken.data['refreshToken']
            )

            if (updateRefreshToken.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_UPDATE_REFRESHTOKEN_TO_DB)
                    )
                )
            }

            const getExpirationDate = await this.authService.getExpiration(
                generateAcessToken.data['accessToken'],
                process.env.ACCESS_TOKEN_SECRET
            )

            if (getExpirationDate.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_GET_EXPIRATION_DATE_TOKEN)
                    )
                )
            }

            const getExpirationDateRefresh = await this.authService.getExpiration(
                generateRefreshToken.data['refreshToken'],
                process.env.REFRESH_TOKEN_SECRET
            )
            console.log('refreshToken', generateRefreshToken.data['refreshToken'])
            console.log('expirationRefresh:', getExpirationDateRefresh)

            if (getExpirationDateRefresh.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_GET_EXPIRATION_DATE_TOKEN)
                    )
                )
            }

            // Object.assign(findOne.data, {
            //     accessToken: generateAcessToken.data['accessToken'],
            //     expirationDate: getExpirationDate.data
            // })

            return res.status(Config.RES_CODE_SUCCESS_OK).send(
                new ResponseData(
                    Config.RES_STT_SUCCESS,
                    {
                        accessToken: generateAcessToken.data['accessToken'],
                        refreshToken: generateRefreshToken.data['refreshToken'],
                        expirationDate: getExpirationDate.data,
                        expirationDateRefresh: getExpirationDateRefresh.data
                    },
                    ''
                )
            )
        } catch (err) {
            return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                new ResponseData<object>(
                    Config.RES_STT_FAILED,
                    {},
                    err.message
                )
            )
        }
    }

    @UseGuards(RefreshTokenGuard)
    @Get('signout')
    public async signout(
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            // console.log('user:', req['user'])
            const clear = await this.authService.clearRefreshTokenDb(req['user'].id)

            if (clear.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        clear.message
                    )
                )
            }

            return res.status(Config.RES_CODE_SUCCESS_OK).send(
                new ResponseData(
                    Config.RES_STT_SUCCESS,
                    {},
                    clear.message
                )
            )
        } catch (err) {
            return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                new ResponseData<object>(
                    Config.RES_STT_FAILED,
                    {},
                    err.message
                )
            )
        }
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    public async refreshToken(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<Response> {
        try {
            const userId = req['user'].id

            const refreshToken = req['user'].refreshToken

            const updateTokens = await this.authService.confirmToken(
                userId,
                refreshToken
            )

            if (updateTokens.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData<object>(
                        Config.RES_STT_FAILED,
                        {},
                        updateTokens.message
                    )
                )
            }

            const getExpirationDate = await this.authService.getExpiration(
                updateTokens.data['accessToken'],
                process.env.ACCESS_TOKEN_SECRET
            )

            if (getExpirationDate.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_GET_EXPIRATION_DATE_TOKEN)
                    )
                )
            }

            const getExpirationDateRefresh = await this.authService.getExpiration(
                updateTokens.data['refreshToken'],
                process.env.REFRESH_TOKEN_SECRET
            )
            console.log('refreshToken', updateTokens.data['refreshToken'])
            console.log('expirationRefresh:', getExpirationDateRefresh)

            if (getExpirationDateRefresh.status !== Config.RES_STT_SUCCESS) {
                return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                    new ResponseData(
                        Config.RES_STT_FAILED,
                        {},
                        messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_GET_EXPIRATION_DATE_TOKEN)
                    )
                )
            }

            return res.status(Config.RES_CODE_SUCCESS_OK).send(
                new ResponseData<object>(
                    Config.RES_STT_SUCCESS,
                    {
                        accessToken: updateTokens.data['accessToken'],
                        refreshToken: updateTokens.data['refreshToken'],
                        expirationDate: getExpirationDate.data,
                        expirationDateRefresh: getExpirationDateRefresh.data
                    },
                    ''
                )
            )
        } catch (err) {
            return res.status(Config.RES_CODE_ERR_EXTERNAL).send(
                new ResponseData<object>(
                    Config.RES_STT_FAILED,
                    {},
                    err.message
                )
            )
        }
    }
}