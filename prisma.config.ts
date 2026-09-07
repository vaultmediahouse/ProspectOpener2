import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
  orm: {
    include: ["**/prisma/**/*.prisma"],
  },
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});