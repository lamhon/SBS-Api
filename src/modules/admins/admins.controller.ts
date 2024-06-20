import { Controller, Get, Post, Body, Request as RequestNest, Res, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Request as RequestExpress, Response } from 'express';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import Config from 'src/configs/configs';
import { ResponseData } from 'src/global/response.global';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import messageText from 'src/configs/message';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) { }

  @Post('profile')
  @UseGuards(AccessTokenGuard)
  public async getProfile(
    @Res() res: Response,
    @RequestNest() req: RequestExpress
  ): Promise<Response> {
    try {
      console.log('req:', req['user']['id'])
      // const id = req['user'].id
      const getProfile = await this.adminsService.getProfile(req['user']['id'])

      if (getProfile.status !== Config.RES_STT_SUCCESS) {
        return res.status(Config.RES_CODE_ERR_BAD_RQ).send(
          new ResponseData(
            getProfile.status || Config.RES_STT_FAILED,
            {},
            getProfile.message || messageText.MESS_ERR_UNKNOWN.replace('{0}', Config.ERROR_CODE_QUERY_FAILED)
          )
        )
      }

      return res.status(Config.RES_CODE_SUCCESS_OK).send(
        new ResponseData(
          Config.RES_STT_SUCCESS,
          getProfile.data,
          ''
        )
      )

      // return res.status(Config.RES_CODE_SUCCESS_OK).send(
      //   new ResponseData(
      //     Config.RES_STT_SUCCESS,
      //     {
      //       accessToken: generateAcessToken.data['accessToken'],
      //       refreshToken: generateRefreshToken.data['refreshToken'],
      //       expirationDate: getExpirationDate.data,
      //       expirationDateRefresh: getExpirationDateRefresh.data
      //     },
      //     ''
      //   )
      // )
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

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
