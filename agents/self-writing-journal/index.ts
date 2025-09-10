import OpenAI from "openai";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async () => {
  let fileContents: string[] = []

  // Read all files from the text-files directory
  try {
    const textFilesDir = join(__dirname, "text-files");
    const files = readdirSync(textFilesDir);

    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = join(textFilesDir, file);
        const content = readFileSync(filePath, 'utf-8');
        fileContents.push(`File: ${file}\n${content}`);
      }
    }
  } catch (error) {
    console.error("Error reading text files:", error);
  }


  let input = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `read the provided text strings and based on the contents, generate a full html document with bulleted lists and headings. if the item is prefixed with "todo", put it under a "To Do" heading; if it is prefixed with "idea", put it under an "Ideas" heading, etc. Remove the prefix. If there is no prefix, put it under a " Miscellaneous Note" heading. The H1 of the document should be todays date, which is ${Date()}, formatted as MM/DD/YYYY`,
        },
        ...fileContents.map((text) => ({
          type: "input_text" as const,
          text,
        })),
      ],
    },
  ];

  let openAiResponse = await openai.responses.create({
    model: "gpt-5-nano",
    //@ts-ignore
    input,
  });


  if (openAiResponse.output_text) {
    return openAiResponse.output_text;
  }

  const response = "<html><body><h1>Hello from the internet</h1><p>The internet welcomes you</p></body></html>"

  return response;
};
