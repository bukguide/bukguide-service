import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

class uploadAvatarDto {
    @ApiProperty({ type: String, format: "binary" })
    file: any;
} // Setup Swagger

@ApiTags("UploadService")
@Controller('upload')
export class UploadController {
    @ApiConsumes("multipart/form-data")  // Setup Swagger
    @ApiBody({ type: uploadAvatarDto })  // Setup Swagger
    @UseInterceptors(FileInterceptor("file", {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const id = req.params.id;
                const folderPath = path.join(__dirname, `../../public/avatar/${id}`);

                // Kiểm tra xem thư mục đã tồn tại chưa
                if (!fs.existsSync(folderPath)) fs.mkdirSync(`public/avatar/${id}`);
                else fs.readdir(folderPath, (err, files) => {
                    files.forEach(file => {
                        const filePath = path.join(folderPath, file);
                        // Xoá file
                        fs.unlink(filePath, err => {
                            console.log('Đã xoá file:', filePath);
                        });
                    })
                })

                // console.log(fs.existsSync(folderPath));
                callback(null, process.cwd() + `/public/avatar/${id}`)
            },
            filename: (req, file, callback) => {
                const id = req.params.id;
                let date = new Date();
                return callback(null, `${id}_${date.getTime()}_${file.originalname}`)
            }
        })
    }))
    @Post('upload/:id')
    uploadAvatar(@Param('id') id: string, @UploadedFile('file') fileUpload: Express.Multer.File) {
        return fileUpload
    }
}
