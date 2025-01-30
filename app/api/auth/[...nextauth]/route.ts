import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Dynamically import db only at runtime
                const { db } = await import("@/db");

                const user = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, credentials.email))
                    .get();

                if (!user || !user.password_hash) {
                    return null;
                }

                const isPasswordValid = await compare(credentials.password, user.password_hash);
                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.user_id.toString(),
                    email: user.email,
                    name: user.display_name,
                };
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const { db } = await import("@/db"); // lazy import again
                const existingUser = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email!))
                    .get();

                if (!existingUser) {
                    await db.insert(users).values({
                        email: user.email!,
                        display_name: user.name,
                        google_id: user.id,
                    });
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
        error: "/api/auth/error",
    },
});

export { handler as GET, handler as POST };
