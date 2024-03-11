import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { AuthGuard } from '@nestjs/passport';
import { checkPermission } from 'src/ultiService/ultiService';
import { unAuthor } from 'src/config/respone.service';
import { TagCreateDto, TagUpdateDto } from 'src/dto/tag.dto';

@ApiTags("TagService")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller('tag')
export class TagController {
    constructor(
        private readonly TagService: TagService
    ) { }

    @HttpCode(201)
    @Get('get')
    get(@Query("keySearch") keySearch: string, @Query("pageNumber") pageNumber: string, @Query("pageSize") pageSize: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TagService.get(keySearch, parseInt(pageNumber), parseInt(pageSize))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get-id')
    getOne(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TagService.getOne(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get-option')
    getOption(@Req() req) {
        try {
            if (!checkPermission(req, ["admin", "toureguide"])) return unAuthor()
            return this.TagService.getOption()
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Post('create')
    create(@Body() dataCreate: TagCreateDto, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TagService.create(dataCreate)
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Post('update/:id')
    update(@Body() dataUpdate: TagUpdateDto, @Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TagService.update(dataUpdate, parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Delete('delete')
    delete(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TagService.delete(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
