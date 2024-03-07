import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserCreateDto, UserLoginDto, UserUpdateDto } from '../dto/users.dto';
import * as bcrypt from 'bcrypt';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { convertTsVector } from 'src/ultiService/ultiService';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const prisma = new PrismaClient()

@Injectable()
export class UsersService {
    constructor(private jwtService: JwtService, private config: ConfigService) { }

    async getUsers(keySearch: string, pageNumber: number, pageSize: number) {
        try {
            let data = await prisma.user_info.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                        { email: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
                include: {
                    permission: true,
                    user_language: {
                        include: { language: true }
                    },
                    user_location: {
                        include: { location: true }
                    },
                    user_type_toure: {
                        include: { type_toure: true }
                    }
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            })
            let countTotalData = await prisma.user_info.count({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                        { email: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
            })

            return successGetPage(data, pageNumber, pageSize, countTotalData)
        } catch (error) {
            return errorCode(error.message)
        }
    };

    async signup(userInfo: UserCreateDto) {
        // Check if user already exists
        let checkEmail = await prisma.user_info.findFirst({ where: { email: userInfo.email } })
        let checkEmirates_id = await prisma.user_info.findFirst({ where: { emirates_id: userInfo.emirates_id } })
        let checkLicense_no = await prisma.user_info.findFirst({ where: { license_no: userInfo.license_no } })
        let checkNumber_phone = await prisma.user_info.findFirst({ where: { number_phone: userInfo.number_phone } })

        if (checkEmail) return "Email already exists!"
        if (checkEmirates_id) return "Emirates id already exists!"
        if (checkLicense_no) return "License no already exists!"
        if (checkNumber_phone) return "Number phone already exists!"

        // HashSync user information
        let { location_id, language_id, type_toure_id, ...dataUserInfo } = userInfo
        let dataUserCreate: any = { ...dataUserInfo, password: bcrypt.hashSync(userInfo.password, 10), created_at: new Date(), updated_at: new Date() }

        try {
            let newUser = await prisma.user_info.create({ data: dataUserCreate })

            // Create foreign key
            if (userInfo.language_id) {
                userInfo.language_id.map((el: any, idx: any) => {
                    const findLanguage = async () => {
                        let getLanguage = await prisma.language.findFirst({ where: { id: el } })
                        if (getLanguage) await prisma.user_language.create({
                            data: { language_id: el, user_id: newUser.id }
                        })
                    }
                    findLanguage()
                })
            }
            if (userInfo.location_id) {
                userInfo.location_id.map((el: any, idx: any) => {
                    const findLocation = async () => {
                        let getLocation = await prisma.location.findFirst({ where: { id: el } })
                        if (getLocation) await prisma.user_location.create({
                            data: { location_id: el, user_id: newUser.id }
                        })
                    }
                    findLocation()
                })
            }
            if (userInfo.type_toure_id) {
                userInfo.type_toure_id.map((el: any, idx: any) => {
                    const findTypeToure = async () => {
                        let getTypeToure = await prisma.type_toure.findFirst({ where: { id: el } })
                        if (getTypeToure) await prisma.user_type_toure.create({
                            data: { type_toure_id: el, user_id: newUser.id }
                        })
                    }
                    findTypeToure()
                })
            }

            return successCode({ userName: newUser.name }, "User created successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(userInfo: UserUpdateDto, id: number) {
        try {
            await prisma.user_info.update({
                where: { id },
                data: { ...userInfo, updated_at: new Date() }
            })

            return successCode({ username: userInfo.name }, "User updated successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOne(id: number) {
        try {
            let dataFind = await prisma.user_info.findFirst({
                where: { id },
                include: {
                    permission: true,
                    user_language: {
                        include: { language: true }
                    },
                    user_location: {
                        include: { location: true }
                    },
                    user_type_toure: {
                        include: { type_toure: true }
                    }
                }
            })
            let { password, ...dataResult } = dataFind
            return successCode(dataResult, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async delete(id: number) {
        try {
            await prisma.user_info.delete({
                where: { id },
            })
            return successCode({ id }, "User deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async login(userLogin: UserLoginDto) {
        try {
            let checkUser = await prisma.user_info.findFirst({
                where: { email: userLogin.email },
                include: { permission: true }
            })
            if (!checkUser) return failCode("Email not found!")

            if (bcrypt.compareSync(userLogin.password, checkUser.password)) {
                let { password, ...data } = { ...checkUser }
                let token = this.jwtService.sign(
                    { data: data },
                    {
                        expiresIn: '72h',
                        secret: this.config.get('SECRET_KEY')
                    }
                )
                return successCode({ token: token }, "Login successful!")
            } else {
                return failCode("Passwords incorrect!")
            }
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
