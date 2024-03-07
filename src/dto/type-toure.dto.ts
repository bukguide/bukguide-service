import { ApiProperty } from "@nestjs/swagger";

export class TypeToureCreateDto {
    @ApiProperty()
    name: string;
}

export class TypeToureUpdateDto {
    @ApiProperty()
    name: string;
}