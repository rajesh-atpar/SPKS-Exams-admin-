import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/privacy-policy",
        "/privacy-policy.html",
        "/delete-account",
        "/delete-account.html",
      ],
      disallow: "/",
    },
  };
}
