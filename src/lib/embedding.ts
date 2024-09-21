import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { OpenAIEmbeddings } from "@langchain/openai";

// export const embeddings = new HuggingFaceInferenceEmbeddings({
//     model: "Xenova/all-MiniLM-L6-v2",
//     apiKey: process.env.HUGGING_FACE_API,
// })

export const embeddings = new OpenAIEmbeddings()