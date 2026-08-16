import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Projekt-ref sættes når ejeren opretter Trigger.dev-projektet (HANDOFF §6.6)
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_selja_placeholder",
  dirs: ["./trigger"],
  maxDuration: 300,
  build: {
    // sharp er en native dependency og skal med i job-bundlet
    external: ["sharp"],
  },
});
