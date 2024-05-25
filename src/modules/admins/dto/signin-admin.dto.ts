import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import Config from "src/configs/configs";

export class SigninAdminDto {
    @IsString()
    @MaxLength(Config.USERNAME_MAX_LENGTH)
    @MinLength(Config.USERNAME_MIN_LENGTH)
    readonly username: string;

    @IsString()
    @MinLength(Config.PWD_MIN_LENGTH)
    @MaxLength(Config.PWD_MAX_LENGTH)
    @Matches(Config.FORMAT_PASSWORD, {
        message: `Mật khẩu cần có độ dài trên ${Config.PWD_MIN_LENGTH} ký tự,
                    có chưa ít nhất 1 ký tự đặc biệt và có chứa chữ cái in thường và in hoa!`
    })
    readonly pwd: string;
}