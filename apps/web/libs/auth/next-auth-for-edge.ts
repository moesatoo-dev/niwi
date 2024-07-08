import { NextAuthConfig } from "next-auth";

const nextAuthEdgeConfig = {
  secret: process.env.SECRET_HASH_KEY,
  pages: {
    signIn: "/auth/login",
  },
  session: {
    maxAge: 30 * 24 * 60 * 60,
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider === "google") {
        console.log({ account, profile });
      }

      return true;
    },

    authorized: ({ auth, request }) => {
      // Run every request with middleware
      const isLoggedIn = Boolean(auth?.user);
      const pathName = request.nextUrl.pathname;
      const isTryingToAdminRoute = pathName.includes("/dashboard");
      const isTryingToAuthRote =
        pathName.includes("/auth/login") || pathName.includes("/sign-up");

      if (!isLoggedIn && isTryingToAdminRoute) {
        return false;
      }

      if (isLoggedIn && isTryingToAdminRoute) {
        return true;
      }

      if (isLoggedIn && isTryingToAuthRote) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
    jwt: ({ token, user, trigger }) => {
      if (user) {
        // When user sign in
        token.userId = user.id as string;
        token.email = user.email as string;
      }

      if (trigger === "update") {
        // When requesting update
      }

      return token;
    },
    session: ({ session, token }) => {
      if (session) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
} as NextAuthConfig;

export default nextAuthEdgeConfig;
