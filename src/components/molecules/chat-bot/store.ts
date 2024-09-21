import { create } from "zustand";
import ChatBotState from "./ChatBotState";
import { ChatWindowMessage } from "@/types/ChatWindowMessage";

const useChatBot = create<ChatBotState>(set => ({
    messages: [],
    selectedPdf: null,
    setMessages: (msgs: ChatWindowMessage[]) => set({ messages: msgs }),
    setSelectedPdf: (file: File | null) => set({ selectedPdf: file }),
}));

export default useChatBot;