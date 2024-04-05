import { ApiProperty } from "@nestjs/swagger";

export class TypeTourCreateDto {
    @ApiProperty()
    name: string;
}

export class TypeTourUpdateDto {
    @ApiProperty()
    name: string;
}