import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags("ChatService")
@Controller('chat')
export class ChatController {
    constructor(
        private readonly ChatService: ChatService
    ) { }

    @Get('get-conversations/:id')
    getConversations(@Param('id') id: string) {
        return this.ChatService.getConversations(parseInt(id))
    }

    @Get('get-chat/:user1_id/:user2_id')
    getChat(@Param('user1_id') user1_id: string, @Param('user2_id') user2_id: string) {
        return this.ChatService.getChat(parseInt(user1_id), parseInt(user2_id))
    }
}
