import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import Config from "src/configs/configs";

@Entity()
export class Admins {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: 'character varying',
        length: Config.USERNAME_MAX_LENGTH,
        unique: true,
        nullable: false
    })
    username: string

    @Column({
        type: 'character varying',
        length: 200,
        nullable: false
    })
    pwd: string

    @Column({
        type: 'character varying',
        length: Config.FULLNAME_MAX_LENGTH,
        nullable: false
    })
    fullname: string

    @Column({
        type: 'character varying',
        length: Config.AVATAR_MAX_LENGTH,
        nullable: true
    })
    avatar: string

    @Column({
        type: 'boolean',
        nullable: false
    })
    sex: boolean

    @Column({
        type: 'character varying',
        length: Config.PHONE_MAX_LENGTH,
        nullable: false
    })
    phone_number: string

    @Column({
        type: 'character varying',
        length: Config.IDENTIFICATION_LENGTH,
        nullable: true
    })
    identifi_number: string

    @Column({
        type: 'character varying',
        length: Config.EMAIL_MAX_LENGTH,
        nullable: false
    })
    email: string

    @Column({ type: 'date', nullable: false })
    birthday: Date

    @Column({
        type: 'character varying',
        length: Config.ADDRESS_MAX_LENGTH,
        nullable: true
    })
    address: string

    @Column({
        type: 'character varying',
        nullable: true
    })
    refresh_token: string

    @Column({ type: 'char', length: 2, default: Config.TYPE_ACTIVE })
    delete_type: string
}