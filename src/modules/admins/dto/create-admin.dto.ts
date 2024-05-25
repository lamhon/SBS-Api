import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength
} from "class-validator";
import Config from "src/configs/configs";

export class CreateAdminDto {
    @IsString()
    @MinLength(Config.USERNAME_MIN_LENGTH, { message: '' })
    @MaxLength(Config.USERNAME_MAX_LENGTH)
    @IsNotEmpty()
    username: string

    @IsString()
    @MinLength(Config.PWD_MIN_LENGTH)
    @MaxLength(Config.PWD_MAX_LENGTH)
    @Matches(Config.FORMAT_PASSWORD, {
        message: `Mật khẩu cần có độ dài trên ${Config.PWD_MIN_LENGTH} ký tự,
                    có chưa ít nhất 1 ký tự đặc biệt và có chứa chữ cái in thường và in hoa!`
    })
    @IsNotEmpty()
    pwd: string

    @IsString()
    @MinLength(Config.FULLNAME_MIN_LENGTH)
    @MaxLength(Config.FULLNAME_MAX_LENGTH)
    @IsNotEmpty()
    fullName: string

    @IsString()
    @MaxLength(Config.AVATAR_MAX_LENGTH)
    avatar: string

    @IsBoolean()
    sex: boolean

    @IsString()
    @IsNotEmpty()
    @MaxLength(Config.PHONE_MAX_LENGTH)
    phoneNumber: string

    @IsString()
    @Length(Config.IDENTIFICATION_LENGTH)
    identifiNumber: string

    @IsEmail()
    @MinLength(Config.EMAIL_MAX_LENGTH)
    @MaxLength(Config.EMAIL_MAX_LENGTH)
    email: string

    @IsDate()
    birthday: Date

    @IsString()
    @MaxLength(Config.ADDRESS_MAX_LENGTH)
    address: string
}
