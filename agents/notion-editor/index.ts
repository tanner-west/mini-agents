import OpenAI from "openai";
import { tools } from "@/common/openAiUtils";
import { addRowToDatabase } from "@/common/notionUtils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (
  providedImage?: string,
  handleUpdates?: (message: string) => void
) => {
  let imageDataUrls: string[] = [];

  if (providedImage) {
    imageDataUrls.push(providedImage);
  }

  handleUpdates?.("✅ Image received, processing with AI...");

  let input = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: "Have a look at these images. If one of them appears to be a screenshot of a workout app, call the correct tool to add the info to the database. Assume each set is 12 reps, and the weight of each set is 100 pounds. If you can't call a tool, describe the image in detail",
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
      model: "gpt-5-nano",
      tools,
      // @ts-ignore
      input,
    })
  } catch (e) {
    handleUpdates?.("❌ Error processing image\n\n" + e);
    return;
  }


  if (!openAiResponse.output.some((item) => item.type == "function_call")) {
    handleUpdates?.("❌ Not calling github edit tool\n\n GPT Says: " + openAiResponse?.output_text);
    return;
  }

  handleUpdates?.("✅ Saving to database...");

  const promises: Promise<void>[] = [];
  openAiResponse.output.forEach(async (item) => {
    if (item.type == "function_call") {
      let functionCallArguments = JSON.parse(item.arguments);
      promises.push(
        addRowToDatabase({
          exercise: functionCallArguments.exercise,
          weight: functionCallArguments.weight,
          reps: functionCallArguments.reps,
          date: functionCallArguments.date,
        })
      );
    }
  });

  try {
    await Promise.all(promises);
  } catch (e) {
    handleUpdates?.("❌ Error updating database\n\n" + e);
    return;
  }

  handleUpdates?.("✅ Database updated!");

  return { success: true, message: "Workout data processed successfully" };
};
