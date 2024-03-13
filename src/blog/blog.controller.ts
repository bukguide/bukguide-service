import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { BlogCreateDto, BlogUpdateDto } from 'src/dto/blog.dto';
import { checkPermission } from 'src/ultiService/ultiService';
import { unAuthor } from 'src/config/respone.service';

@ApiTags("BlogService")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller('blog')
export class BlogController {
    constructor(
        private readonly BlogService: BlogService
    ) { }

    @HttpCode(201)
    @Post('create')
    create(@Body() blogData: BlogCreateDto, @Req() req) {
        try {
            if (!checkPermission(req, ["Tourguide", "admin"])) return unAuthor()
            return this.BlogService.create(blogData)
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // Lấy Blog theo blog_id
    @HttpCode(201)
    @Get('get-id')
    getOne(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["Tourguide", "admin"])) return unAuthor()
            return this.BlogService.getOne(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // Lấy toàn bộ Blog và filter theo user_id, tag, type_tour. Tìm kiếm theo keyWord
    @HttpCode(201)
    @Get('get')
    getUser(@Query("keySearch") keySearch: string,
        @Query("pageNumber") pageNumber: string,
        @Query("pageSize") pageSize: string,
        @Query("userId") userId: number,
        @Query("tagId") tagId: number[],
        @Query("typeTourId") typeTourId: number[],
        @Req() req) {
        try {
            if (!checkPermission(req, ["Tourguide", "admin"])) return unAuthor()
            return this.BlogService.getBlog(
                keySearch,
                parseInt(pageNumber),
                parseInt(pageSize),
                userId * 1,
                tagId ? JSON.parse(tagId.toString()) : [],
                typeTourId ? JSON.parse(typeTourId.toString()) : [],
            )
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    };
    // Chỉnh sửa
    @HttpCode(201)
    @Post("update/:id")
    update(@Body() BlogInfo: BlogUpdateDto, @Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin", "Tourguide"])) return unAuthor()
            return this.BlogService.update(BlogInfo, parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    // Xoá
    @HttpCode(201)
    @Delete('delete')
    delete(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin", "Tourguide"])) return unAuthor()
            return this.BlogService.delete(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
