import GithubProvider from "next-auth/providers/github"

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      profile(profile: any) {

        let userRole = "user";
        if (profile?.email == process.env.ADMIN_EMAIL) {
          userRole = "admin";
        }


        return {
            ...profile,
            role: userRole
        }
      },
      clientId: process.env.GITHUB_ID ? process.env.GITHUB_ID : '',
      clientSecret: process.env.GITHUB_SECRET ? process.env.GITHUB_SECRET : '',
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    }
  }
}
