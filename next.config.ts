import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite testar o dev server pelo IP da rede local (ex.: celular)
  allowedDevOrigins: ["192.168.100.*", "192.168.*.*"],
};

export default nextConfig;
