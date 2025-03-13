"use client";

"use client";

import React, { useState } from "react";
import { Send, ImagePlus, Loader2, Trash2 } from "lucide-react";

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

interface GenerateImageResponse {
  imageUrls: string[];
  error?: string;
}

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data: GenerateImageResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const newImages = data.imageUrls.map((url) => ({
        url,
        prompt,
        timestamp: Date.now() + Math.random(),
      }));

      setImages(newImages);
      setPrompt("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate images. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (timestamp: number) => {
    setImages((prev) => prev.filter((img) => img.timestamp !== timestamp));
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-[#6366F1]">
          AI Image Generator
        </h1>
        <p className="text-gray-400">
          Generate 6 unique variations of your imagination
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative bg-[#1a1a1a] rounded-xl p-2 border border-gray-800">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate... (e.g., 'A cyberpunk city at sunset with flying cars')"
            className="w-full p-4 rounded-lg pr-12 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#6366F1] bg-[#121212] text-gray-100 placeholder-gray-500 resize-none"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="absolute bottom-4 right-4 p-2 rounded-lg bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-2xl mx-auto bg-red-900/20 text-red-400 p-4 rounded-xl border border-red-900/50">
          {error}
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8 space-y-4">
          <Loader2 className="w-24 h-24 animate-spin mx-auto text-white" />
          <p className="text-gray-300 text-lg">Creating your masterpieces...</p>
          <p className="text-gray-500 text-sm">
            Generating 6 unique variations
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Generated Images
          </h2>
          <p className="text-gray-400 mb-6">Prompt: {images[0].prompt}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.timestamp}
                className="bg-[#121212] rounded-xl overflow-hidden transition-transform hover:scale-[1.02] group"
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(image.timestamp)}
                    className="p-2 bg-[#1a1a1a] rounded-full hover:bg-red-500 text-white transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !isGenerating && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Your generated images will appear here
          </p>
        </div>
      )}

      <footer className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-center mt-10 text-gray-400 py-4 border-t border-gray-800">
        <p>
          &copy; {new Date().getFullYear()} Pritam Chakraborty. All rights
          reserved.
        </p>

        <p>
          <a
            href="https://github.com/itssodope01/ImageGen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6366F1] hover:underline"
          >
            GitHub Repository
          </a>
        </p>
      </footer>
    </div>
  );
};

export default ImageGenerator;
