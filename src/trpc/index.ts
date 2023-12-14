// import { useSession } from 'next-auth/react';
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { connectToDB } from "../../utils/database";
import User from "../../models/user";
import Files from "../../models/files";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authoption } from "../app/api/auth/[...nextauth]/route";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import messageModal from "../../models/messageModel";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const session = await getServerSession(authoption);

    console.log("session in index.ts ", session);

    if (!session?.user || !session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    connectToDB();

    const dbUser = await User.findOne({
      id: session?.user?.id,
    });

    if (!dbUser) {
      await User.create({
        email: session.user.email,
        username: session.user.name.replace(" ", "").toLowerCase(),
        image: session.user.image,
      });
    }

    return { success: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    connectToDB();

    const files = await Files.find({ userId: userId });
    // console.log("files: " + files)
    return files;
  }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      connectToDB();
      const file = await Files.find({
        key: input.key,
        userId,
      });

      //  console.log("file in getFile func " + file)

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  deleleFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      connectToDB();
      console.log("input id :  ", input);
      const file = await Files.deleteOne({ _id: input.id });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      connectToDB();

      const file = await Files.find({
        _id: input.fileId,
        userId: ctx.userId,
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file[0].status };
    }),

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      connectToDB();
      const file = await Files.find({
        _id: fileId,
        userId,
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      if (cursor) {
        const cursorMessage = await messageModal.findOne({
          _id: cursor,
          fileId,
        });

        const messages = await messageModal
          .find({ fileId, createdAt: { $gt: cursorMessage.createdAt } })
          .sort({ createdAt: -1 })
          .limit(limit);

        const nextCursor = messages.length > limit ? messages.pop()?._id : null;
        return { messages, nextCursor };
      } else {
        const messages = await messageModal
          .find({ fileId })
          .sort({ createdAt: -1 })
          .limit(limit);

        const nextCursor = messages.length > limit ? messages.pop()?._id : null;

        return { messages, nextCursor: nextCursor };
      }
    }),

  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;
    const billingUrl = absoluteUrl("/dashboard/billing");

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    console.log("hala 0");
    connectToDB();

    const dbUser = await User.findOne({
      _id: userId,
    });

    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const subscriptionPlan = await getUserSubscriptionPlan();

    console.log("hala ");
    console.log("subscriptionPlan.isSubscribed", subscriptionPlan.isSubscribed)


    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });
      console.log("hala 1.9")
      return { url: stripeSession.url };
    }
    console.log("hala 2");

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    console.log("stripeSession.metadata",stripeSession.metadata);
    console.log("url",stripeSession.url);
    return { url: stripeSession.url };
  }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
