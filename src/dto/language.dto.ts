import { ApiProperty } from "@nestjs/swagger";

export class LanguageCreateDto {
    @ApiProperty()
    name: string;
}

export class LanguageUpdateDto {
    @ApiProperty()
    name: string;
}