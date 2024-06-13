import { Body, Controller, Delete, Get, Headers, HttpCode, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards, } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserClientCreateDto, UserCreateDto, UserLoginDto, UserResetPasswordDto, UserUpdateDto } from '../dto/users.dto';
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

    @Post('signup-client')
    signupClient(@Body() UserInfo: UserClientCreateDto) {
        return this.UsersService.signupClient(UserInfo)
    }

    @Post('signup-client-google')
    signupGoogle(@Body() UserInfo: string) {
        return this.UsersService.signupGoogle(UserInfo)
    }

    @Post('login')
    login(@Body() UserLogin: UserLoginDto) {
        return this.UsersService.login(UserLogin)
    }

    @Post('login-google')
    loginGoogle(@Body() UserLogin: string) {
        return this.UsersService.loginGoogle(UserLogin)
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Post('reset-password')
    resetPassword(@Body() UserResetPassword: UserResetPasswordDto, @Req() req) {
        try {
            if (!checkPermission(req, ["admin", "tourguide"])) return unAuthor()
            return this.UsersService.resetPassword(UserResetPassword, parseInt(req.user.data.id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Post('reset-password-token')
    resetPasswordToken(@Req() req) {
        try {
            if (!checkPermission(req, ["admin", "tourguide"])) return unAuthor()
            return this.UsersService.resetPasswordToken(req.user.data)
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get')
    getUser(@Query("keySearch") keySearch: string,
        @Query("pageNumber") pageNumber: string,
        @Query("pageSize") pageSize: string,
        @Query("approve") approve: boolean,
        @Query("permission_id") permission_id: number,
        @Query("language_id") language_id: number[],
        @Query("location_id") location_id: number[],
        @Query("type_tour_id") type_tour_id: number[],
        @Query("expertise_id") expertise_id: number[],
        @Req() req) {
        try {
            // if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.UsersService.getUsers(
                keySearch,
                parseInt(pageNumber),
                parseInt(pageSize),
                approve.toString(),
                permission_id * 1,
                language_id ? JSON.parse(language_id.toString()) : [],
                location_id ? JSON.parse(location_id.toString()) : [],
                type_tour_id ? JSON.parse(type_tour_id.toString()) : [],
                expertise_id ? JSON.parse(expertise_id.toString()) : [],
            )
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    };

    @HttpCode(201)
    @Get('get-id')
    getOne(@Query("id") id: string, @Req() req) {
        try {
            // if (!checkPermission(req, ["admin", "tourguide"])) return unAuthor()
            return this.UsersService.getOne(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @HttpCode(201)
    @Get('get-option')
    getOption(@Req() req) {
        try {
            // if (!checkPermission(req, ["admin", "Tourguide"])) return unAuthor()
            return this.UsersService.getOption()
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Post("update/:id")
    update(@Body() UserInfo: UserUpdateDto, @Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin", "tourguide"])) return unAuthor()
            return this.UsersService.update(UserInfo, parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Post("approve/:id")
    approve(@Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.UsersService.approve(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard("jwt"))
    @HttpCode(201)
    @Post("un-approve/:id")
    unApprove(@Param("id") id: string, @Req() req) {
        try {
            if (!checkPermission(req, ["admin"])) return unAuthor()
            return this.UsersService.unApprove(parseInt(id))
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
            if (!checkPermission(req, ["admin", "tourguide"])) return unAuthor()
            if (req.user.data.id != id && req.user.data.permission.role != "admin") return unAuthor()
            return this.UsersService.delete(parseInt(id))
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
