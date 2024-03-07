import { ApiProperty } from "@nestjs/swagger";

export class UserCreateDto {
    // @ApiProperty()
    // id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    emirates_id: string;
    @ApiProperty()
    license_no: string;
    @ApiProperty()
    expiry_date: Date;
    @ApiProperty()
    permission_id: number;
    @ApiProperty()
    email: string;
    @ApiProperty()
    number_phone: string;
    @ApiProperty()
    password: string;

    created_at: Date;
    updated_at: Date;
}
export class UserUpdateDto {
    // @ApiProperty()
    // id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    emirates_id: string;
    @ApiProperty()
    license_no: string;
    @ApiProperty()
    expiry_date: Date;
    @ApiProperty()
    email: string;
    @ApiProperty()
    number_phone: string;
}
export class UserLoginDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}
