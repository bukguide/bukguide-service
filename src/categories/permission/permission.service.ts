import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, successCode } from 'src/config/respone.service';

const prisma = new PrismaClient()

@Injectable()
export class PermissionService {
    async getOption() {
        try {
            let dataFind = await prisma.permission.findMany()
            let result = dataFind?.map(el => {
                return { id: el.id, name: el.role }
            })
            return successCode(result, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
