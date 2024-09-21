import { ChatWindowMessage } from "@/types/ChatWindowMessage";
import {
    AIMessage,
    type BaseMessage,
    HumanMessage,
} from "@langchain/core/messages";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const makeStream = <T extends Record<string, unknown>>(generator: AsyncGenerator<T, void, unknown>) => {

    const encoder = new TextEncoder();
    return new ReadableStream<any>({
        async start(controller) {
            for await (let chunk of generator) {
                controller.enqueue(chunk);
            }
            controller.close();
        }
    });
}

export const formatChatHistoryAsMessages = async (
    chatHistory: ChatWindowMessage[],
) => {
    return chatHistory.map((chatMessage) => {
        console.log(chatMessage)
        if (chatMessage.role === "human") {
            return new HumanMessage(chatMessage.content);
        } else {
            return new AIMessage(chatMessage.content);
        }
    });
};