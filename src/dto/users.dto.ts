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
    @ApiProperty({ required: false })
    language_id: number[];
    @ApiProperty({ required: false })
    location_id: number[];
    @ApiProperty({ required: false })
    type_tour_id: number[];
    @ApiProperty({ required: false })
    expertise_id: number[];

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
    @ApiProperty({ required: false })
    language_id: number[];
    @ApiProperty({ required: false })
    location_id: number[];
    @ApiProperty({ required: false })
    type_tour_id: number[];
    @ApiProperty({ required: false })
    expertise_id: number[];
}

export class UserLoginDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}

export class UserResetPasswordDto {
    @ApiProperty()
    password_old: string;
    @ApiProperty()
    password_new: string;
}
