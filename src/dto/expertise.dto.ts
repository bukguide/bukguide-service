import { ApiProperty } from "@nestjs/swagger";

export class ExpertiseCreateDto {
    @ApiProperty()
    name: string;
}

export class ExpertiseUpdateDto {
    @ApiProperty()
    name: string;
}