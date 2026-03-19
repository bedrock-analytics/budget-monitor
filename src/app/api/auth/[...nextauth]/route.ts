import NextAuth, { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_CLIENT_ID ?? process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_TENANT_ID ?? process.env.NEXT_PUBLIC_AZURE_TENANT_ID,
      checks: ["pkce"], // ✅ IMPORTANT
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
