export const tools = [
  {
    name: "add_workout",
    description: "Add a new workout to the database",
    strict: true,
    type: "function" as const,
    parameters: {
      type: "object",
      properties: {
        exercise: {
          type: "string",
          description: "The exercise name",
        },
        weight: {
          type: "number",
          description: "The weight value",
        },
        reps: {
          type: "number",
          description: "The reps value",
        },
        date: {
          type: "string",
          description: "The date in ISO format (e.g., 2025-08-17)",
        },
      },
      required: ["exercise", "weight", "reps", "date"],
      additionalProperties: false,
    },
  },
  {
    name: "edit_github",
    description: "edits a file in a github repository",
    strict: true,
    type: "function" as const,
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to edit the file with",
        },
      },
      additionalProperties: false,
      required: ["content"],
    },
  },
];
