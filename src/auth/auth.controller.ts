import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import Config from "src/configs/configs";
import { ResponseData } from "src/global/response.global";
import { SigninAdminDto } from "src/modules/admins/dto/signin-admin.dto";
import { AuthService } from "./auth.service";
import messageText from "src/configs/message";
import * as bcrypt from "bcrypt";
import { AuthGuard } from "./auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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
                        findOne.message || messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_CANNOT_GET_MESSAGE)
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

            const getExpirationDate = await this.authService.getExpiration(
                generateAcessToken.data['accessToken']
            )
            console.log(getExpirationDate)

            if (getExpirationDate.status !== Config.RES_STT_SUCCESS) {
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
                        expirationDate: getExpirationDate.data
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