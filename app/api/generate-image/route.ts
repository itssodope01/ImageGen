import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const generations = await Promise.all(
      Array(6)
        .fill(null)
        .map(() =>
          replicate.run(
            "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
            {
              input: {
                prompt,
                num_outputs: 1,
                guidance_scale: 7.5,
                num_inference_steps: 50,
              },
            }
          )
        )
    );

    const imageUrls = generations.flat();

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
