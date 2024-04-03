import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { TagCreateDto, TagUpdateDto } from 'src/dto/tag.dto';
import { convertTsVector, maxId } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class TagService {

    async get(keySearch: string, pageNumber: number, pageSize: number) {
        try {
            let data = await prisma.tag.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            })
            let countTotalData = await prisma.tag.count({
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
            let dataFind = await prisma.tag.findFirst({
                where: { id },
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOption() {
        try {
            let dataFind = await prisma.tag.findMany()
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async create(dataCreate: TagCreateDto) {
        try {
            let dataFind = await prisma.tag.findFirst({
                where: { name: dataCreate.name }
            })

            if (dataFind) return failCode("Tag already exists!")

			const maxIdTag = await maxId(prisma.tag)

            const newData = await prisma.tag.create({ data: {...dataCreate , id: maxIdTag}})
            return successCode(newData, "Create successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(dataUpdate: TagUpdateDto, id: number) {
        try {
            let dataFind = await prisma.tag.findFirst({
                where: { id }
            })
            if (!dataFind) return failCode("Tag not found!")

            await prisma.tag.update({
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
            await prisma.tag.delete({
                where: { id },
            })
            return successCode({ id }, "Tag deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
