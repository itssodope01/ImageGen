import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    console.log("API route called");

    let requestBody;
    try {
      requestBody = await request.json();
      console.log("Request body:", requestBody);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { prompt } = requestBody;

    if (!prompt) {
      console.log("Missing prompt");
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log(`Generating images for prompt: "${prompt}"`);

    try {
      const singleGeneration = await replicate.run(
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

      console.log("Generation result:", singleGeneration);

      return NextResponse.json({ imageUrls: singleGeneration });
    } catch (replicateError) {
      console.error("Replicate API error:", replicateError);
      return NextResponse.json(
        { error: "Error from image generation API" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
