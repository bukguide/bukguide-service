import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { PrismaClient } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { maxId } from 'src/ultiService/ultiService';
import { ChatService } from './chat.service';
import { errorCode, successCode } from 'src/config/respone.service';
import { log } from 'console';

const prisma = new PrismaClient()

@WebSocketGateway({ namespace: '/socket.io', cors: true })
export class ChatGateway {
  constructor(
    private readonly ChatService: ChatService
  ) { }

  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('joinMessage')
  handleRegister(client: Socket, userId: string): void {
    this.users.set(userId, client.id);
  }

  @SubscribeMessage('getConvertsations')
  async handleGetConvertsations(client: Socket, userId: string) {
    try {
      const conversions = await this.ChatService.getConversations(parseInt(userId))
      this.server.to(client.id).emit('getConvertsations', conversions);
    } catch (error) {
      errorCode("Get conversation failed!")
    }
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any) {
    const { message, sendFrom, sendTo } = payload

    const findConversation = await prisma.chat_message.findFirst({
      where: {
        OR: [
          {
            AND: [
              { user1_id: sendFrom },
              { user2_id: sendTo }
            ]
          },
          {
            AND: [
              { user1_id: sendTo },
              { user2_id: sendFrom }
            ]
          }
        ]
      }
    })

    const maxIdChat = await maxId(prisma.chat_message)
    let dataCreate = {
      id: maxIdChat,
      user1_id: null,
      user2_id: null,
      user_send: sendFrom,
      time: new Date(),
      message
    }
    if (findConversation) {
      dataCreate.user1_id = findConversation.user1_id
      dataCreate.user2_id = findConversation.user2_id
    }
    else {
      dataCreate.user1_id = sendFrom
      dataCreate.user2_id = sendTo
    }
    const dataNew: any = await prisma.chat_message.create({ data: dataCreate })
    const recipientSocketId = this.users.get(sendTo);

    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('message', dataNew);
      this.server.to(recipientSocketId).emit('getConvertsations', successCode([dataNew], "success"));
    } else {
      console.log(`User ${recipientSocketId} is not connected`);
    }
    this.server.to(client.id).emit('message', dataNew);
    this.server.to(client.id).emit('getConvertsations', successCode([dataNew], "success"));
    return 'Hello world!';
  }
}
