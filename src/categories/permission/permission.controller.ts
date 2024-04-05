import { Controller, Get, HttpCode, HttpException, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { checkPermission } from 'src/ultiService/ultiService';
import { unAuthor } from 'src/config/respone.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags("PermissionService")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller('permission')
export class PermissionController {
    constructor(
        private readonly PermissionService: PermissionService
    ) { }

    @HttpCode(201)
    @Get('get-option')
    getOption(@Req() req) {
        try {
            if (!checkPermission(req, ["admin", "Tourguide"])) return unAuthor()
            return this.PermissionService.getOption()
        } catch (error) {
            throw new HttpException("Error Server", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
