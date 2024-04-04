import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { LanguageCreateDto, LanguageUpdateDto } from 'src/dto/language.dto';
import { convertTsVector, maxId } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class LanguageService {

    async get(keySearch: string, pageNumber: number, pageSize: number) {
        try {
            let data = await prisma.language.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,

            })
            let countTotalData = await prisma.language.count({
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
            let dataFind = await prisma.language.findFirst({
                where: { id },
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOption() {
        try {
            let dataFind = await prisma.language.findMany({
                include: {
                    _count: {
                        select: { user_language: true }
                    }
                }
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async create(dataCreate: LanguageCreateDto) {
        try {
            let dataFind = await prisma.language.findFirst({
                where: { name: dataCreate.name }
            })

            if (dataFind) return failCode("Language already exists!")

            const maxIdLanguage = await maxId(prisma.language)
            const newData = await prisma.language.create({ data: { ...dataCreate, id: maxIdLanguage } })
            return successCode(newData, "Create successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(dataUpdate: LanguageUpdateDto, id: number) {
        try {
            let dataFind = await prisma.language.findFirst({
                where: { id }
            })
            if (!dataFind) return failCode("Language not found!")

            await prisma.language.update({
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
            await prisma.language.delete({
                where: { id },
            })
            return successCode({ id }, "Language deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
