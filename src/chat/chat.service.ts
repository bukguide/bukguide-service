import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { log } from 'console';
import { errorCode, successCode } from 'src/config/respone.service';

const prisma = new PrismaClient()

@Injectable()
export class ChatService {

    async getConversations(userId: number) {
        const result = await prisma.chat_message.findMany({
            where: {
                OR: [
                    { user1_id: userId },
                    { user2_id: userId },
                ],
            },
            include: {
                user_info_chat_message_user1_idTouser_info: {
                    select: { name: true, avatar: true, id: true }
                },
                user_info_chat_message_user2_idTouser_info: {
                    select: { name: true, avatar: true, id: true }
                },
            },
            distinct: ['user1_id', 'user2_id'],
            orderBy: {
                time: 'desc',
            },
        });
        if (result.length > 0) {
            const data = result.map(el => {
                const {
                    user_info_chat_message_user1_idTouser_info,
                    user_info_chat_message_user2_idTouser_info,
                    ...elConvert } = {
                    ...el,
                    user1_id: el.user_info_chat_message_user1_idTouser_info,
                    user2_id: el.user_info_chat_message_user2_idTouser_info
                }
                return elConvert
            })
            return successCode(data, "Get conversation success")
        }
        else return successCode([], "Get conversation success");
    }

    async getChat(user1_id: number, user2_id: number) {
        try {
            const findConversation = await prisma.chat_message.findMany({
                where: {
                    OR: [
                        {
                            AND: [
                                { user1_id },
                                { user2_id }
                            ]
                        },
                        {
                            AND: [
                                { user1_id: user2_id },
                                { user2_id: user1_id }
                            ]
                        }
                    ]
                },
                include: {
                    user_info_chat_message_user1_idTouser_info: {
                        select: { name: true, avatar: true, id: true }
                    },
                    user_info_chat_message_user2_idTouser_info: {
                        select: { name: true, avatar: true, id: true }
                    },
                },
                orderBy: {
                    time: 'desc',
                },
                // take: 50,
            })
            if (findConversation.length > 0) {
                const data = findConversation.map(el => {
                    const {
                        user_info_chat_message_user1_idTouser_info,
                        user_info_chat_message_user2_idTouser_info,
                        ...elConvert } = {
                        ...el,
                        user1_id: el.user_info_chat_message_user1_idTouser_info,
                        user2_id: el.user_info_chat_message_user2_idTouser_info
                    }
                    return elConvert
                })
                return successCode(data, "Get conversation success")
            }
            else return successCode([], "Get conversation success");
        } catch (error) {
            return errorCode("Get chat message failed")
        }
    }
}
