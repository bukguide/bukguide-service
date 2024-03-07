import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TypeToureService } from './type-toure.service';
import { AuthGuard } from '@nestjs/passport';
import { checkPermission } from 'src/ultiService/ultiService';
import { unAuthor } from 'src/config/respone.service';
import { TypeToureCreateDto, TypeToureUpdateDto } from 'src/dto/type-toure.dto';

@ApiTags("TypeToureService")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller('type-toure')
export class TypeToureController {
    constructor(
        private readonly TypeToureService: TypeToureService
    ) { }

    @HttpCode(201)
    @Get('get')
    get(@Query("keySearch") keySearch: string, @Query("pageNumber") pageNumber: string, @Query("pageSize") pageSize: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeToureService.get(keySearch, parseInt(pageNumber), parseInt(pageSize))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get-id')
    getOne(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeToureService.getOne(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get-option')
    getOption(@Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeToureService.getOption()
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Post('create')
    create(@Body() dataCreate: TypeToureCreateDto, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeToureService.create(dataCreate)
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Post('update/:id')
    update(@Body() dataUpdate: TypeToureUpdateDto, @Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeToureService.update(dataUpdate, parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Delete('delete')
    delete(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeToureService.delete(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
