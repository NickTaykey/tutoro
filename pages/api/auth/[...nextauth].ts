import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '../../../middleware/mongo-connect';
import User from '../../../models/User';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      await connectDB();
      const userFound = await User.findOne({ email: user.email });
      if (!userFound) {
        await User.create({
          username: user.name,
          email: user.email,
          avatar: user.image,
        });
      }
      return true;
    },
  },
});
