import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { connectToDB } from "../../../../../utils/database";
import User from "./../../../../../models/user";

const authoption = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        await connectToDB();
        const sessionUser = await User.findOne({ email: session.user.email });
        session.user.id = sessionUser._id.toString();

        return session;
      } catch (error) {
        console.log("error in session callback : ", error);
      }
    },

    async signIn({ profile }) {
      try {
        await connectToDB();
        //  check if user already exists
        const userExist = await User.findOne({
          email: profile.email,
        });

        //  if not then create a new user
        if (!userExist) {
        //   const stripeCustomerId = profile.stripeCustomerId || null;

          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
            // stripeCustomerId: stripeCustomerId,
          });
        }
        return true;
      } catch (error) {
        console.log("error in signIn function", error);
      }
    },
  },
};

const handler = NextAuth(authoption);

export { handler as GET, handler as POST, authoption };
