import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@lens/core"],
  serverExternalPackages: ["@huggingface/transformers"],
};

export default config;
