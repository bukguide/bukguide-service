import axios from "axios";

export const discordSendMessage = async (message: any) => {
    const payload = {
        content: message,
    }

    try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL, payload);
    } catch (error) {
        console.error('Error sending message to Discord:', error);
    }
}