import { PLANS } from "@/config/stripe";
import { getServerSession } from "next-auth";
import { authoption } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import User from "../../models/user";
import { connectToDB } from "../../utils/database";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  const session = await getServerSession(authoption);
  const user = session?.user;

  if (!user._id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }
 connectToDB()
  const dbUser  = await User.find({ _id: user._id });

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dbUser[0].stripePriceId  &&
      dbUser[0].stripeCurrentPeriodEnd && // 86400000 = 1 day
      dbUser[0].stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser[0].stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && dbUser[0].stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser[0].stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...plan,
    stripeSubscriptionId: dbUser[0].stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser[0].stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser[0].stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
