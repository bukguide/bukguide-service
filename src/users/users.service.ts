import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserCreateDto, UserUpdateDto } from '../dto/users.dto';
import * as bcrypt from 'bcrypt';
import { errorCode, successCode, successGetPage } from 'src/config/respone.service';
import { convertTsVector } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class UsersService {

    async getUsers(keySearch: string, pageNumber: number, pageSize: number): Promise<any> {
        try {
            let data = await prisma.user_info.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { email: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            })
            let countTotalData = await prisma.user_info.count({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { email: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
            })

            return successGetPage(data, pageNumber, pageSize, countTotalData)
        } catch (error) {
            return errorCode(error.message)
        }
    };

    async signup(userInfo: UserCreateDto): Promise<any> {
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
        let dataUserInfo: any = { ...userInfo, password: bcrypt.hashSync(userInfo.password, 10), created_at: new Date(), updated_at: new Date() }

        try {
            await prisma.user_info.create({ data: dataUserInfo })
            return successCode({ username: dataUserInfo.name }, "User created successfully!")
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
                include: { permission: true }
            })
            let { password, ...dataResult } = dataFind
            return dataResult
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
}
