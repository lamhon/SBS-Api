import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admins } from './entities/admins.entity';
import { Repository } from 'typeorm';
import { ResponseData } from 'src/global/response.global';
import Config from 'src/configs/configs';
import messageText from 'src/configs/message';

@Injectable()
export class AdminsService {

  constructor(
    @InjectRepository(Admins) private readonly adminRepository: Repository<Admins>,
  ) { }

  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admins`;
  }

  async findOne(username: string): Promise<ResponseData<object>> {
    try {
      const getAdmin = await this.adminRepository.query(`
        SELECT id, username, pwd, fullname, avatar FROM login_admin('${username}')
      `)

      console.log(getAdmin)
    } catch (err) {
      return new ResponseData(Config.RES_STT_FAILED, {}, err.message)
    }
  }

  async getProfile(id: string): Promise<ResponseData<object>> {
    try {
      const getProfile = await this.adminRepository.query(`
          SELECT id, username, fullname, avatar, sex, phone_number, identifi_number, email, birthday, address
          FROM admins
          WHERE id = '${id}'
        `)

        if (!getProfile || getProfile.length === 0) {
          return new ResponseData(
              Config.RES_STT_FAILED,
              {},
              messageText.MESS_WRONG_LOGIN
          )
      }

      return new ResponseData(
          Config.RES_STT_SUCCESS,
          getProfile[0],
          ''
      )
    } catch (err) {
      return new ResponseData(Config.RES_STT_FAILED, {}, err.message)
    }
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
