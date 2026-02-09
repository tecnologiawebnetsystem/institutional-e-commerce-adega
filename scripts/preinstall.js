// Only clean node_modules during Vercel deployment builds
// This fixes corrupted build cache issues (ENOTDIR errors)
if (process.env.VERCEL === "1") {
  const { rmSync } = require("fs");
  try {
    rmSync("node_modules", { recursive: true, force: true });
    console.log("[preinstall] Cleaned node_modules for fresh install");
  } catch (e) {
    // ignore if doesn't exist
  }
}
