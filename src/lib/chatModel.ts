import { ChatOpenAI } from "@langchain/openai";

export const chatModel = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    stop: ["\nInstruct:", "Instruct:", "<hr>", "\n<hr>"],
});