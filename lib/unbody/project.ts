import { UnbodyAdmin } from "unbody/admin"

if (!process.env.UNBODY_API_KEY) {
  throw new Error("UNBODY_API_KEY is required")
}

if (!process.env.UNBODY_PROJECT_ID) {
  throw new Error("UNBODY_PROJECT_ID is required")
}

const admin = new UnbodyAdmin({
  apiKey: process.env.UNBODY_API_KEY,
  projectId: process.env.UNBODY_PROJECT_ID,
})

export const project = admin.project 