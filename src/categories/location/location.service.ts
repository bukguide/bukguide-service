import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { LocationCreateDto, LocationUpdateDto } from 'src/dto/location.dto';
import { convertTsVector, maxId } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class LocationService {

    async get(keySearch: string, pageNumber: number, pageSize: number) {
        try {
            let data = await prisma.location.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            })
            let countTotalData = await prisma.location.count({
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
            let dataFind = await prisma.location.findFirst({
                where: { id },
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOption() {
        try {
            let dataFind = await prisma.location.findMany({
                include: {
                    _count: {
                        select: { user_location: true }
                    }
                }
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async create(dataCreate: LocationCreateDto) {
        try {
            let dataFind = await prisma.location.findFirst({
                where: { name: dataCreate.name }
            })

            if (dataFind) return failCode("Location already exists!")

            const maxIdLocation = await maxId(prisma.location)
            const newData = await prisma.location.create({ data: { ...dataCreate, id: maxIdLocation } })
            return successCode(newData, "Create successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(dataUpdate: LocationUpdateDto, id: number) {
        try {
            let dataFind = await prisma.location.findFirst({
                where: { id }
            })
            if (!dataFind) return failCode("Location not found!")

            await prisma.location.update({
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
            await prisma.location.delete({
                where: { id },
            })
            return successCode({ id }, "Location deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
