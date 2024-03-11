import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LanguageService } from './language.service';
import { AuthGuard } from '@nestjs/passport';
import { checkPermission } from 'src/ultiService/ultiService';
import { unAuthor } from 'src/config/respone.service';
import { LanguageCreateDto, LanguageUpdateDto } from 'src/dto/language.dto';

@ApiTags("LanguageService")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller('language')
export class LanguageController {
    constructor(
        private readonly LanguageService: LanguageService
    ) { }

    @HttpCode(201)
    @Get('get')
    get(@Query("keySearch") keySearch: string, @Query("pageNumber") pageNumber: string, @Query("pageSize") pageSize: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.LanguageService.get(keySearch, parseInt(pageNumber), parseInt(pageSize))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get-id')
    getOne(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.LanguageService.getOne(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get-option')
    getOption(@Req() req) {
        try {
            if (!checkPermission(req, ["admin", "toureguide"])) return unAuthor()
            return this.LanguageService.getOption()
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Post('create')
    create(@Body() dataCreate: LanguageCreateDto, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.LanguageService.create(dataCreate)
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Post('update/:id')
    update(@Body() dataUpdate: LanguageUpdateDto, @Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.LanguageService.update(dataUpdate, parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Delete('delete')
    delete(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.LanguageService.delete(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
