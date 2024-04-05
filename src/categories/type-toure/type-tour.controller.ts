import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TypeTourService } from './type-tour.service';
import { AuthGuard } from '@nestjs/passport';
import { checkPermission } from 'src/ultiService/ultiService';
import { unAuthor } from 'src/config/respone.service';
import { TypeTourCreateDto, TypeTourUpdateDto } from 'src/dto/type-tour.dto';

@ApiTags("TypeTourService")
@Controller('type-tour')
export class TypeTourController {
    constructor(
        private readonly TypeTourService: TypeTourService
    ) { }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Get('get')
    get(@Query("keySearch") keySearch: string, @Query("pageNumber") pageNumber: string, @Query("pageSize") pageSize: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeTourService.get(keySearch, parseInt(pageNumber), parseInt(pageSize))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Get('get-id')
    getOne(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeTourService.getOne(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get-option')
    getOption(@Req() req) {
        try {
            // if (!checkPermission(req, ["admin", "Tourguide"])) return unAuthor()
            return this.TypeTourService.getOption()
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Post('create')
    create(@Body() dataCreate: TypeTourCreateDto, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeTourService.create(dataCreate)
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Post('update/:id')
    update(@Body() dataUpdate: TypeTourUpdateDto, @Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeTourService.update(dataUpdate, parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Delete('delete')
    delete(@Query("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.TypeTourService.delete(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
