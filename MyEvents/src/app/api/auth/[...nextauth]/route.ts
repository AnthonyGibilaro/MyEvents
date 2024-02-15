import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.GOOGLE_SECRET ?? "",
        }),
    ],
    secret: process.env.SECRET,
    callbacks: {
        async session({ session, token }) {
            session.userId = token.id;
            return session;
        }
        ,
        async jwt({ token, user, account, profile }) {
            if (account) {
                token.id = user.id;
            }
            return token;
        }
        ,
        async signIn({ user, account, profile }) {
            if (!account || !profile) {
                console.error("Account or profile is undefined");
                return false;
            }

            if (account.provider !== 'google') {
                console.error("Unknown provider:", account.provider);
                return false;
            }

            try {
                const email = profile.email;
                const name = profile.name;
                const avatar = profile.picture || "URL_IMAGE_PAR_DEFAUT";
                const googleId = user.id;

                let dbUser = await prisma.user.findUnique({ where: { email } });

                if (!dbUser) {
                    dbUser = await prisma.user.create({
                        data: {
                            email: email,
                            pseudo: name,
                            name: name,
                            avatar: avatar,
                            googleId: user.id,
                        }
                    });
                } else {
                    await prisma.user.update({
                        where: { email: email },
                        data: {
                            googleId: user.id,
                            name: name,
                            avatar: dbUser.avatar ? dbUser.avatar : avatar,
                        }
                    });
                }
                user.id = dbUser.id;
            } catch (error) {
                console.error("Database error during signIn:", error);
                return false;
            }

            return true;
        }
    }
});

export { handler as GET, handler as POST };
