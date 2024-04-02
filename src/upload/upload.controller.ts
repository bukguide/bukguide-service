import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { UploadService } from './upload.service';
import { AuthGuard } from '@nestjs/passport';
import { checkPermission, deleteFileInFolder } from 'src/ultiService/ultiService';
import { successCode, unAuthor } from 'src/config/respone.service';

class uploadAvatarDto {
    @ApiProperty({ type: String, format: "binary" })
    file: any;
}

class FileUploadMultipleDto {
    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
    files: any[];
}

@ApiTags("UploadService")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller('upload')
export class UploadController {
    constructor(
        private readonly UploadService: UploadService
    ) { }

    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: uploadAvatarDto })
    @UseInterceptors(FileInterceptor("file", {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const user_id = req.params.user_id;
                const folderPath = path.join(__dirname, `../../public/avatar/${user_id}`);

                // Kiểm tra xem thư mục đã tồn tại chưa
                if (!fs.existsSync(folderPath)) fs.mkdirSync(`public/avatar/${user_id}`);
                else deleteFileInFolder(folderPath)
                callback(null, process.cwd() + `/public/avatar/${user_id}`)
            },
            filename: (req, file, callback) => {
                const user_id = req.params.user_id;
                let date = new Date();
                return callback(null, `${user_id}_${date.getTime()}_${file.originalname}`)
            }
        })
    }))
    @HttpCode(201)
    @Post('upload-avatar/:user_id')
    uploadAvatar(
        @Param('user_id') user_id: string,
        @UploadedFile('file') fileUpload: Express.Multer.File,
        @Req() req
    ) {
        try {
            if (!checkPermission(req, ["admin", "tourguide"])) return unAuthor()
            return this.UploadService.uploadAvatar(parseInt(user_id), fileUpload)
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiConsumes("multipart/form-data")
    @ApiBody({
        type: FileUploadMultipleDto,
    })
    @UseInterceptors(FilesInterceptor("files", 10, {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const blog_id = req.params.blog_id;
                const folderPath = path.join(__dirname, `../../public/blog/${blog_id}`);

                // Kiểm tra xem thư mục đã tồn tại chưa
                if (!fs.existsSync(folderPath)) fs.mkdirSync(`public/blog/${blog_id}`);
                callback(null, process.cwd() + `/public/blog/${blog_id}`)
            },
            filename: (req, file, callback) => {
                const blog_id = req.params.blog_id;
                let date = new Date();
                return callback(null, `${blog_id}_${date.getTime()}_${file.originalname}`)
            }
        })
    }))
    @HttpCode(201)
    @Post('upload-blog/:blog_id')
    async uploadImageBlog(
        @Param('blog_id') blog_id: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Req() req
    ) {
        try {
            if (!checkPermission(req, ["admin", "tourguide"])) return unAuthor()
            const uploadPromises = files.map(file => this.UploadService.createImageBlog(parseInt(blog_id), file));
            await Promise.all(uploadPromises);
            return successCode(files, "Upload image successfully!")
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('delete')
    deleteFile(
        @Query("file_id") file_id: string,
        @Req() req
    ) {
        try {
            if (!checkPermission(req, ["admin", "tourguide"])) return unAuthor()
            return this.UploadService.deleteFile(parseInt(file_id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
