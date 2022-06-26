import GoogleProvider from 'next-auth/providers/google';
import connectDB from '../../../middleware/mongo-connect';
import User from '../../../models/User';
import NextAuth, { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await connectDB();
      const userFound = await User.findOne({ email: user.email });
      if (!userFound) {
        await User.create({
          fullname: user.name,
          email: user.email,
          avatar: user.image,
        });
      }
      return true;
    },
  },
};

export default NextAuth(authOptions);
