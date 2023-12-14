import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";
import User from "../../../../../models/user";
import { connectToDB } from "../../../../../utils/database";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200,
    });
  }
  
  console.log("hello bhai kuch to javab do")

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    console.log("hello from strip")
    connectToDB();

    const subscribedUser = await User.find({_id : session.metadata.userId})
    console.log("subscribedUser", subscribedUser)
   const updatedUser =  await User.findByIdAndUpdate(
      { _id: session.metadata.userId },
      {
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
      { new: true } 
    );
   
    await updatedUser.save();

    console.log("updatedUser", updatedUser);

  }

  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    connectToDB();
    await User.findByIdAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      }
    );
  }

  return new Response(null, { status: 200 });
}
