import { ApiProperty } from "@nestjs/swagger";

export class LocationCreateDto {
    @ApiProperty()
    name: string;
}

export class LocationUpdateDto {
    @ApiProperty()
    name: string;
}