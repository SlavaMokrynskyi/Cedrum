import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const publicRoot = path.resolve(__dirname, "public");
const buildDir = path.resolve(__dirname, "build");
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
) as { version: string };
const packageVersion = packageJson.version;

function getVendorChunkName(id: string) {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  if (id.includes("react-router")) {
    return "router-vendor";
  }

  if (id.includes("poseidon-lite")) {
    return "poseidon-vendor";
  }

  if (
    id.includes("@chakra-ui") ||
    id.includes("@emotion") ||
    id.includes("@floating-ui") ||
    id.includes("@popperjs") ||
    id.includes("@zag-js") ||
    id.includes("@ark-ui") ||
    id.includes("framer-motion") ||
    id.includes("react-focus-lock") ||
    id.includes("focus-lock") ||
    id.includes("react-remove-scroll") ||
    id.includes("aria-hidden") ||
    id.includes("stylis") ||
    id.includes("copy-to-clipboard") ||
    id.includes("@ctrl/tinycolor") ||
    id.includes("lodash.mergewith")
  ) {
    return "chakra-vendor";
  }

  if (
    id.includes("@cedra-labs") ||
    id.includes("@scure") ||
    id.includes("@noble") ||
    id.includes("axios") ||
    id.includes("buffer") ||
    id.includes("base64-js") ||
    id.includes("ieee754") ||
    id.includes("js-base64")
  ) {
    return "cedra-vendor";
  }

  if (
    id.includes("@tanstack") ||
    id.includes("react-cookie") ||
    id.includes("universal-cookie") ||
    id.includes("constate")
  ) {
    return "state-vendor";
  }

  if (id.includes("qr-code-styling")) {
    return "qr-vendor";
  }

  if (
    id.includes("react") ||
    id.includes("scheduler") ||
    id.includes("use-sync-external-store")
  ) {
    return "react-vendor";
  }

  return "vendor";
}

function copyStaticPublicFiles() {
  return {
    name: "copy-static-public-files",
    apply: "build" as const,
    closeBundle() {
      fs.mkdirSync(buildDir, { recursive: true });

      for (const entry of fs.readdirSync(publicRoot, { withFileTypes: true })) {
        if (entry.name === "index.html") {
          continue;
        }

        const sourcePath = path.resolve(publicRoot, entry.name);
        const destinationPath = path.resolve(buildDir, entry.name);

        if (entry.name === "manifest.json") {
          const manifest = JSON.parse(
            fs.readFileSync(sourcePath, "utf8"),
          ) as Record<string, unknown>;

          manifest.version = packageVersion;

          fs.writeFileSync(
            destinationPath,
            `${JSON.stringify(manifest, null, 2)}\n`,
          );
          continue;
        }

        if (entry.isDirectory()) {
          fs.cpSync(sourcePath, destinationPath, { recursive: true });
          continue;
        }

        fs.copyFileSync(sourcePath, destinationPath);
      }
    },
  };
}

export default defineConfig({
  root: publicRoot,
  base: "./",
  publicDir: false,
  plugins: [react(), copyStaticPublicFiles()],
  resolve: {
    alias: {
      core: path.resolve(__dirname, "src/core"),
      pages: path.resolve(__dirname, "src/pages"),
      App: path.resolve(__dirname, "src/App.tsx"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageVersion),
  },
  build: {
    outDir: buildDir,
    emptyOutDir: false,
    target: "chrome114",
    rollupOptions: {
      output: {
        manualChunks: getVendorChunkName,
      },
    },
  },
});
