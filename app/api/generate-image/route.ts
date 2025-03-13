import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const TESTING_MODE = true;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Processing prompt:", prompt);

    const count = TESTING_MODE ? 1 : 6;

    const generations = await Promise.all(
      Array(count)
        .fill(null)
        .map(async () => {
          console.log("Sending request to Replicate");
          const result = await replicate.run(
            "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
            {
              input: {
                prompt,
                num_outputs: 1,
                guidance_scale: 7.5,
                num_inference_steps: 50,
              },
            }
          );
          console.log("Replicate response:", result);
          return result;
        })
    );

    const imageUrls = generations
      .flat()
      .filter((url) => typeof url === "string");
    console.log("Processed URLs:", imageUrls);

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Generation error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate images";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
