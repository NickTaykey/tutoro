import { getUserDocumentObject } from '../../../utils/casting-helpers';
import * as models from '../../../models';
import type { UserDocument } from '../../../models/User';
import GoogleProvider from 'next-auth/providers/google';
import NextAuth, { NextAuthOptions } from 'next-auth';

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
      const userFound = await models.User.findOne({ email: user.email });
      if (!userFound) {
        await models.User.create({
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
      const user = await models.User.findOne({
        email: session?.user?.email,
      });
      if (!user) return { ...session, user: {} };
      return {
        ...session,
        user: getUserDocumentObject(user as UserDocument),
      };
    },
  },
};

export default NextAuth(authOptions);
