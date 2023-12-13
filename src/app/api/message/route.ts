import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authoption } from "../auth/[...nextauth]/route";
import { sendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { connectToDB } from "../../../../utils/database";
import Files from "../../../../models/files";
import messageModal from "../../../../models/messageModel";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { getPineconeClient } from "@/lib/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { openai } from "@/lib/openai";
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from "openai";

export const POST = async (req: NextRequest) => {

    const body = await req.json();

    const session = await getServerSession(authoption);
    const user = session?.user;
    const userId = user.id


    if (!userId) {
        return new Response("unauthorized", { status: 401 })
    }

    const { fileId, message } = sendMessageValidator.parse(body)

    connectToDB();
    const file = await Files.find({
        _id: fileId,
        userId
    })

    if (!file) {
        return new Response("Not Found", { status: 404 })
    }
    connectToDB()
    await messageModal.create({
        text: message,
        isUserMessage: true,
        userId,
        fileId
    })

    // vectorize the message

    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY
    })
    const pinecone = await getPineconeClient()
    const pineconeIndex = pinecone.Index("queryquill")


    const vectorstore = await PineconeStore.fromExistingIndex(embeddings, {
    
        pineconeIndex,
        namespace: file[0]._id
    })

    const results = await vectorstore.similaritySearch(message, 4)

    connectToDB();
    const previousMessages = await messageModal.find({ fileId }).sort({ createdAt: 1 }).limit(6)

    const formattedPrevMessages = previousMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" as const : "Assistant" as const,
        content: msg.text
    }))
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        stream: true,
        messages: [
            {
                role: 'system',
                content:
                    'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
            },
            {
                role: 'user',
                content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
              
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
                    if (message.role === 'user') return `User: ${message.content}\n`
                    return `Assistant: ${message.content}\n`
                })}
        
        \n----------------\n
        
        CONTEXT:
        ${results.map((r) => r.pageContent).join('\n\n')}
        
        USER INPUT: ${message}`,
            },
        ],
    })

    const stream = OpenAIStream(response, {
        async onCompletion(completion) {
            connectToDB();
            await messageModal.create({
                text: completion,
                isUserMessage: false,
                fileId,
                userId
            })
        }
    })

    return new StreamingTextResponse(stream)
}