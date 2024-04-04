import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { ExpertiseCreateDto, ExpertiseUpdateDto } from 'src/dto/expertise.dto';
import { convertTsVector, maxId } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class ExpertiseService {

    async get(keySearch: string, pageNumber: number, pageSize: number) {
        try {
            let data = await prisma.expertise.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            })
            let countTotalData = await prisma.expertise.count({
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
            let dataFind = await prisma.expertise.findFirst({
                where: { id },
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOption() {
        try {
            let dataFind = await prisma.expertise.findMany({
                include: {
                    _count: {
                        select: { user_expertise: true }
                    }
                }
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async create(dataCreate: ExpertiseCreateDto) {
        try {
            let dataFind = await prisma.expertise.findFirst({
                where: { name: dataCreate.name }
            })

            if (dataFind) return failCode("Expertise already exists!")

            const maxIdExpertite = await maxId(prisma.expertise)

            const newData = await prisma.expertise.create({ data: { ...dataCreate, id: maxIdExpertite } })
            return successCode(newData, "Create successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(dataUpdate: ExpertiseUpdateDto, id: number) {
        try {
            let dataFind = await prisma.expertise.findFirst({
                where: { id }
            })
            if (!dataFind) return failCode("Expertise not found!")

            await prisma.expertise.update({
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
            await prisma.expertise.delete({
                where: { id },
            })
            return successCode({ id }, "Expertise deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
