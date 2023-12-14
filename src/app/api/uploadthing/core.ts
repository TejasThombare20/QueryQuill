import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authoption } from "../auth/[...nextauth]/route";
import { connectToDB } from "../../../../utils/database";
import Files from "../../../../models/files";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { getPineconeClient } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();

const middleware = async () => {
  const session = await getServerSession(authoption);
  const user = session?.user;

  if (!user || !user.id) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan();

  // Whatever is returned here is accessible in onUploadComplete as `metadata`
  return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  connectToDB();

  const isFileExist = await Files.find({
    key: file.key,
  });

  if (isFileExist) return;

  const createdfile = await Files.create({
    key: file.key,
    name: file.name,
    userId: metadata.userId,
    url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
    status: "PROCESSING",
  });
  await createdfile.save();

  try {
    const response = await fetch(
      `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
    );
    const blob = await response.blob();

    const loader = new PDFLoader(blob);
    const pageleveldocs = await loader.load();

    const pagesAmt = pageleveldocs.length;

    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    const isProExceeds =
      pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
    const isFreeExceeds =
      pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

    if ((isSubscribed && isProExceeds) || (isSubscribed && isFreeExceeds)) {
      connectToDB();

      await Files.findByIdAndUpdate(
        { _id: createdfile._id },
        { status: "FAILED" }
      );
    }

    // vectorize
    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("queryquill");

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    await PineconeStore.fromDocuments(pageleveldocs, embeddings, {
      pineconeIndex,
      namespace: createdfile._id,
    });
    // console.log("hello 3")
    await Files.findByIdAndUpdate(
      { _id: createdfile._id },
      { status: "SUCCESS" }
    );
    createdfile.save();
  } catch (error) {
    console.log("error : ", error);
    await Files.findByIdAndUpdate(
      { _id: createdfile._id },
      { status: "FAILED" }
    );
    createdfile.save();
  }
};

export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
