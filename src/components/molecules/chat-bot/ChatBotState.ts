import { ChatWindowMessage } from "@/types/ChatWindowMessage";

export default interface ChatBotState {
    messages: ChatWindowMessage[],
    selectedPdf: File | null,
    setSelectedPdf: (pdf: File | null) => void
    setMessages: (msgs: ChatWindowMessage[]) => void
} 