/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**"),new URL("https://res.cloudinary.com/**")],
  },
  serverExternalPackages: ["puppeteer-extra", "puppeteer-extra-plugin-stealth", "puppeteer"],
};

export default config;
