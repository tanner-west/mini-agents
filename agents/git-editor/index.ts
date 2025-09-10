import OpenAI from "openai";
import { tools } from "@/common/openAiUtils";
import { editGitHubFile, readGitHubFile } from "@/common/githubUtils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (
  providedImage?: string,
  progressHandler?: (status: string) => void
) => {
  if (
    !process.env.GITHUB_TOKEN ||
    !process.env.GITHUB_OWNER ||
    !process.env.GITHUB_REPO ||
    !process.env.GITHUB_FILE_PATH
  ) {
    throw new Error(
      "Required environment variables are not set: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_FILE_PATH"
    );
  }

  let imageDataUrls: string[] = [];

  if (providedImage) {
    imageDataUrls.push(providedImage);
  }

  progressHandler?.("✅ prompt recieved");

  let fileData;
  try {
    fileData = await readGitHubFile({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: process.env.GITHUB_FILE_PATH!,
      token: process.env.GITHUB_TOKEN!,
    });
  } catch (e) {
    progressHandler?.("❌ Error reading file\n\n" + e);
    return;
  }

  progressHandler?.("✅ generating edits");

  let input = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `have a look at these images. If one of them appears to be a screenshot of a nutrition app, call the github edit tool and append the data proper data to the file. You must write the whole file, so include the existing data in your response. The existing data is ${fileData?.data?.content || ""
            }
          `,
        },
        ...imageDataUrls.map((url) => ({
          type: "input_image" as const,
          image_url: url,
        })),
      ],
    },
  ];

  let openAiResponse;
  try {

    openAiResponse = await openai.responses.create({
      model: "gpt-5-mini",
      tools,
      // @ts-ignore
      input,
    });
  } catch (e) {
    progressHandler?.("❌ Error generating edits\n\n" + e);
    return;
  }

  if (!openAiResponse.output.some((item) => item.type == "function_call")) {
    progressHandler?.("❌ Not calling github edit tool\n\n GPT Says: " + openAiResponse?.output_text);
    return;
  }

  const promises: Promise<any>[] = [];
  openAiResponse.output.forEach(async (item) => {
    if (item.type == "function_call") {
      progressHandler?.("✅ updating file");
      const functionCallArguments = JSON.parse(item.arguments);
      if (
        !process.env.GITHUB_TOKEN ||
        !process.env.GITHUB_OWNER ||
        !process.env.GITHUB_REPO ||
        !process.env.GITHUB_FILE_PATH
      ) {
        throw new Error(
          "Required environment variables are not set: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_FILE_PATH"
        );
      }
      promises.push(
        editGitHubFile({
          owner: process.env.GITHUB_OWNER!,
          repo: process.env.GITHUB_REPO!,
          path: process.env.GITHUB_FILE_PATH!,
          content: functionCallArguments.content,
          message: `edit ${process.env.GITHUB_FILE_PATH} via text prompt`,
          token: process.env.GITHUB_TOKEN!,
        })
      );
    }
  });

  try {
    await Promise.all(promises);
  } catch (e) {
    progressHandler?.("❌ Error updating file\n\n" + e);
    return;
  }

  progressHandler?.("✅ file updated");

  return {
    success: true,
    message: "File processed and updated in GitHub based on text prompt",
  };
};
