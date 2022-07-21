import connectDB from '../../../middleware/mongo-connect';
import GoogleProvider from 'next-auth/providers/google';
import NextAuth, { NextAuthOptions } from 'next-auth';
import User from '../../../models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/tutors',
  },
  secret: process.env.NEXT_PUBLIC_SECRET,
  callbacks: {
    async signIn({ user }) {
      await connectDB();
      const userFound = await User.findOne({ email: user.email });
      if (!userFound) {
        await User.create({
          fullname: user.name?.trim(),
          email: user.email?.trim(),
          location: '',
          bio: '',
          subjects: [],
        });
      }
      return true;
    },
    async session({ session }) {
      await connectDB();
      const user = await User.findOne({
        email: session?.user?.email,
      });
      if (!user) return { ...session, user: {} };
      return {
        ...session,
        user: {
          _id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          avatar: user.avatar,
          isTutor: user.isTutor,
          bio: user.bio,
          subjects: user.subjects,
          pricePerHour: user.pricePerHour,
          location: user.location,
        },
      };
    },
  },
};

export default NextAuth(authOptions);
