import { Body, Controller, Delete, Get, Headers, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards, } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreateDto, UserLoginDto, UserUpdateDto } from '../dto/users.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { checkPermission } from 'src/ultiService/ultiService';
import { unAuthor } from 'src/config/respone.service';

@ApiTags("UsersService")
@Controller('users')
export class UsersController {
    constructor(
        private readonly UsersService: UsersService
    ) { }

    @Post('signup')
    signUp(@Body() UserInfo: UserCreateDto) {
        return this.UsersService.signup(UserInfo)
    }

    @Post('login')
    login(@Body() UserLogin: UserLoginDto) {
        return this.UsersService.login(UserLogin)
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Get('get')
    getUser(@Query("keySearch") keySearch: string, @Query("pageNumber") pageNumber: string, @Query("pageSize") pageSize: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.UsersService.getUsers(keySearch, parseInt(pageNumber), parseInt(pageSize))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    };

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Post("update/:id")
    update(@Body() UserInfo: UserUpdateDto, @Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin", "toureguide"])) return unAuthor()
            return this.UsersService.update(UserInfo, parseInt(id))
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
            if (!checkPermission(req, ["admin", "toureguide"])) return unAuthor()
            return this.UsersService.getOne(parseInt(id))
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
            if (!checkPermission(req, ["admin", "toureguide"])) return unAuthor()
            return this.UsersService.delete(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
