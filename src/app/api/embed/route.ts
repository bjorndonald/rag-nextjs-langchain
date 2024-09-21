import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import AstraDBService from "@/lib/AstraDBService";
import { dbService } from "@/lib/db";

export const POST = async (req: NextRequest) => {
    const formData = await req.formData()
    const pdf = formData.get("pdf") as Blob

    try {

        const pdfLoader = new WebPDFLoader(pdf, { parsedItemSeparator: " " });
        const docs = await pdfLoader.load();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });

        const splitDocs = await splitter.splitDocuments(docs);
        dbService.addDocument(splitDocs)

        return NextResponse.json({
            type: "complete",
            data: "Ok",
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json(error, { status: 500 })
    }
}