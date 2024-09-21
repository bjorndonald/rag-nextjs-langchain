import { AstraDBVectorStore, AstraLibArgs } from "@langchain/community/vectorstores/astradb";
import { embeddings } from "./embedding";
import { Document } from "langchain/document";

export const astraConfig: AstraLibArgs = {
    token: process.env.ASTRA_DB_APPLICATION_TOKEN as string,
    endpoint: process.env.ASTRA_DB_ENDPOINT as string,
    collection: process.env.ASTRA_DB_COLLECTION ?? "langchain_test",
    collectionOptions: {
        vector: {
            dimension: 1536,
            metric: "cosine",
        },
    },
};

export default class AstraDBService {
    addDocument = async (docs: Document<Record<string, any>>[]) => {
        try {
            await AstraDBVectorStore.fromTexts(
                docs.map(x => x.pageContent),
                docs.map(x => ({ foo: x.metadata, userid: "bjorn" })),
                embeddings,
                astraConfig
            );
        } catch (error) {
            throw error
        }
        // const inserted = await collection.insertMany(documents);
    }

    getRetriever = async () => {
        const vectorStore = await AstraDBVectorStore.fromTexts(
            [],
            [],
            embeddings,
            astraConfig
        );
        return vectorStore.asRetriever();
    }
}