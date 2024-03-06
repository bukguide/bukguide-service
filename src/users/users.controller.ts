import { Body, Controller, Delete, Get, Param, Post, Query, } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreateDto, UserUpdateDto } from '../dto/users.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly UsersService: UsersService
    ) { }

    @Get('get')
    getUser(@Query("keySearch") keySearch: string, @Query("pageNumber") pageNumber: string, @Query("pageSize") pageSize: string): Promise<any> {
        return this.UsersService.getUsers(keySearch, parseInt(pageNumber), parseInt(pageSize))
    };

    @Post('signup')
    SignUp(@Body() UserInfo: UserCreateDto) {
        return this.UsersService.signup(UserInfo)
    }

    @Post("update/:id")
    Update(@Body() UserInfo: UserUpdateDto, @Param("id") id: string) {
        return this.UsersService.update(UserInfo, parseInt(id))
    }

    @Get('get-id')
    GetOne(@Query("id") id: string) {
        return this.UsersService.getOne(parseInt(id))
    }

    @Delete('delete')
    Delete(@Query("id") id: string) {
        return this.UsersService.delete(parseInt(id))
    }
}
