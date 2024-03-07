import { ApiProperty } from "@nestjs/swagger";

export class TagCreateDto {
    @ApiProperty()
    name: string;
}

export class TagUpdateDto {
    @ApiProperty()
    name: string;
}