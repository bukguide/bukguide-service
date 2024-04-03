import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { TypeTourCreateDto, TypeTourUpdateDto } from 'src/dto/type-tour.dto';
import { convertTsVector, maxId } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class TypeTourService {

    async get(keySearch: string, pageNumber: number, pageSize: number) {
        try {
            let data = await prisma.type_tour.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                    ]
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            })
            let countTotalData = await prisma.type_tour.count({
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
            let dataFind = await prisma.type_tour.findFirst({
                where: { id },
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOption() {
        try {
            let dataFind = await prisma.type_tour.findMany()
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async create(dataCreate: TypeTourCreateDto) {
        try {
            let dataFind = await prisma.type_tour.findFirst({
                where: { name: dataCreate.name }
            })

            if (dataFind) return failCode("TypeTour already exists!")

			const maxIdTypeTour = await maxId(prisma.type_tour)
            const newData = await prisma.type_tour.create({ data: {...dataCreate, id: maxIdTypeTour} })
            return successCode(newData, "Create successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(dataUpdate: TypeTourUpdateDto, id: number) {
        try {
            let dataFind = await prisma.type_tour.findFirst({
                where: { id }
            })
            if (!dataFind) return failCode("TypeTour not found!")

            await prisma.type_tour.update({
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
            await prisma.type_tour.delete({
                where: { id },
            })
            return successCode({ id }, "TypeTour deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
