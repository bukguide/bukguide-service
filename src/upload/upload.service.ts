import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, successCode } from 'src/config/respone.service';
import * as fs from 'fs';
import * as path from 'path';
import { deleteFileInFolder } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class UploadService {
    async uploadAvatar(user_id: number, fileUpload: Express.Multer.File) {
        try {
            await prisma.user_info.update({
                where: { id: user_id },
                data: {
                    avatar: fileUpload.filename,
                    updated_at: new Date()
                }
            })
            return successCode(fileUpload.filename, "User upload avatar successfully!")
        } catch (error) {
            const folderPath = path.join(__dirname, `../../public/avatar/${user_id}`);
            deleteFileInFolder(folderPath)
            return errorCode(error.message)
        }
    }

    async createImageBlog(blog_id: number, fileUpload: Express.Multer.File) {
        try {
            await prisma.image_blog.create({
                data: {
                    file_name: fileUpload.filename,
                    blog_id
                }
            })
            return successCode(fileUpload.filename, "Upload image successfully!")
        } catch (error) {
            const folderPath = path.join(__dirname, `../../public/blog/${blog_id}`);
            deleteFileInFolder(folderPath)
            return errorCode(error.message)
        }
    }

    async deleteFile(file_id: number) {
        try {
            const findFile = await prisma.image_blog.findFirst({
                where: { id: file_id }
            })

            if (findFile) {
                const filePath = path.join(__dirname, `../../public/blog/${findFile.blog_id}/${findFile.file_name}`);
                fs.unlink(filePath, err => {
                    console.log('Đã xoá file:', filePath);
                });
            }
            
            await prisma.image_blog.delete({ where: { id: file_id } })
            return successCode("", "Delete image successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
