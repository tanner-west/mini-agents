import { Client } from "@notionhq/client";

const databaseId = process.env.NOTION_DATABASE_ID;
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function addRowToDatabase({
  exercise,
  weight,
  reps,
  date,
}: {
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}) {
  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID is not set");
  }
  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Exercise: {
          title: [
            {
              text: {
                content: exercise,
              },
            },
          ],
        },
        Weight: {
          number: weight,
        },
        Reps: {
          number: reps,
        },
        Date: {
          date: {
            start: date,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error adding row to database:", error);
  }
}
