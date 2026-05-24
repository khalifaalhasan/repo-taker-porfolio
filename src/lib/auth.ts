import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            githubUsername: { type: "string", required: false },
            githubId: { type: "string", required: false },
            githubInstallationId: { type: "string", required: false }
        }
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            mapProfileToUser: (profile) => {
                return {
                    name: profile.name || profile.login,
                    email: profile.email || `${profile.login}@users.noreply.github.com`,
                    image: profile.avatar_url,
                    githubUsername: profile.login,
                    githubId: String(profile.id),
                };
            }
        }
    }
});
