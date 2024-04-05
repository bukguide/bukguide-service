import { ApiProperty } from "@nestjs/swagger";

export class BlogCreateDto {
    @ApiProperty()
    title: string;
    @ApiProperty()
    content: string;
    @ApiProperty()
    key_word: string;
    @ApiProperty()
    user_id: number;
    @ApiProperty({ required: false })
    tag_id: number[];
    @ApiProperty({ required: false })
    type_tour_id: number[];
}

export class BlogUpdateDto {
    @ApiProperty()
    title: string;
    @ApiProperty()
    content: string;
    @ApiProperty()
    key_word: string;
    @ApiProperty()
    user_id: number;
    @ApiProperty({ required: false })
    tag_id: number[];
    @ApiProperty({ required: false })
    type_tour_id: number[];
}
