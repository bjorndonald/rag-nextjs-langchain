import { ChatWindowMessage } from "@/types/ChatWindowMessage";
import { NextRequest, NextResponse } from "next/server";
import {
    type BaseMessage,
} from "@langchain/core/messages";
import type { LanguageModelLike } from "@langchain/core/language_models/base";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import { formatChatHistoryAsMessages, makeStream } from "@/utils/func";
import { chatModel } from "@/lib/chatModel";
import { StreamingResponse } from "@/utils/response";
import AstraDBService from "@/lib/AstraDBService";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RESPONSE_SYSTEM_TEMPLATE } from "@/utils/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { dbService } from "@/lib/db";

async function* generateRAGResponse(
    messages: ChatWindowMessage[],
    {
        chatModel,
        devModeTracer,
    }: {
        chatModel: LanguageModelLike;
        devModeTracer?: LangChainTracer;
    },
) {
    const text = messages[messages.length - 1]?.content;
    const chatHistory = await formatChatHistoryAsMessages(messages.slice(0, -1));
    let responseChainPrompt = ChatPromptTemplate.fromMessages<{
        context: string;
        chat_history: BaseMessage[];
        question: string;
    }>([
        ["system", RESPONSE_SYSTEM_TEMPLATE],
        ["placeholder", "{chat_history}"],
        ["user", `{input}`],
    ]);

    const documentChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt: responseChainPrompt,
        documentPrompt: PromptTemplate.fromTemplate(
            `<doc>\n{page_content}\n</doc>`,
        ),
    });

    let historyAwarePrompt = PromptTemplate.fromTemplate(`{chat_history}
        Given the above conversation, rephrase the following question into a standalone, natural language query with important keywords that a researcher could later pass into a search engine to get information relevant to the conversation. Do not respond with anything except the query.\n\n<question_to_rephrase>\n{input}\n</question_to_rephrase>`);

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: chatModel,
        retriever: await dbService.getRetriever(),
        rephrasePrompt: historyAwarePrompt,
    });

    const retrievalChain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever: historyAwareRetrieverChain,
    });

    const fullChain = retrievalChain.pick("answer");

    const stream = await fullChain.stream(
        {
            input: text,
            chat_history: chatHistory,
        },
        {
            callbacks: devModeTracer !== undefined ? [devModeTracer] : [],
        },
    );

    for await (const chunk of stream) {
        if (chunk) {
            console.log(chunk)
            yield chunk
        }
    }
}

export const POST = async (req: NextRequest) => {
    const { messages } = await req.json()
    try {
        const response = makeStream(generateRAGResponse(messages, {
            chatModel,
        }))

        return new StreamingResponse(response)
    } catch (error) {
        return NextResponse.json(error, { status: 500 })
    }
}