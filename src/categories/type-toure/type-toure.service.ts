import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { TypeToureCreateDto, TypeToureUpdateDto } from 'src/dto/type-toure.dto';
import { convertTsVector } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class TypeToureService {

    async get(keySearch: string, pageNumber: number, pageSize: number) {
        try {
            let data = await prisma.type_toure.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            })
            let countTotalData = await prisma.type_toure.count({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
            })

            return successGetPage(data, pageNumber, pageSize, countTotalData)
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOne(id: number) {
        try {
            let dataFind = await prisma.type_toure.findFirst({
                where: { id },
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOption() {
        try {
            let dataFind = await prisma.type_toure.findMany()
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async create(dataCreate: TypeToureCreateDto) {
        try {
            let dataFind = await prisma.type_toure.findFirst({
                where: { name: dataCreate.name }
            })

            if (dataFind) return failCode("TypeToure already exists!")

            await prisma.type_toure.create({ data: dataCreate })
            return successCode(dataFind, "Create successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(dataUpdate: TypeToureUpdateDto, id: number) {
        try {
            let dataFind = await prisma.type_toure.findFirst({
                where: { id }
            })
            if (!dataFind) return failCode("TypeToure not found!")

            await prisma.type_toure.update({
                where: { id },
                data: dataUpdate
            })
            return successCode(dataFind, "Update successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async delete(id: number) {
        try {
            await prisma.type_toure.delete({
                where: { id },
            })
            return successCode({ id }, "TypeToure deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
