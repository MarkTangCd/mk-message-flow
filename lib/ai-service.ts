import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { generateOpenRouterModelId, type ModelIdOptions } from "./model-mapping";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.warn("OPENROUTER_API_KEY is not set. AI service will not work properly.");
}

const openrouter = createOpenRouter({
  apiKey: apiKey || "",
});

export interface AIExecutionResult {
  success: boolean;
  content?: string;
  error?: string;
  modelUsed: string;
  promptUsed: string;
}

export async function executeAIRequest(
  companyName: string,
  modelName: string,
  prompt: string,
  options?: ModelIdOptions
): Promise<AIExecutionResult> {
  try {
    const modelId = generateOpenRouterModelId(companyName, modelName, options);

    console.log(`Executing AI request with model: ${modelId}`);
    console.log(`Prompt length: ${prompt.length} characters`);

    const startTime = Date.now();
    
    const { text } = await generateText({
      model: openrouter(modelId),
      prompt: prompt,
    });

    const duration = Date.now() - startTime;
    console.log(`AI request completed in ${duration}ms`);

    return {
      success: true,
      content: text,
      modelUsed: modelId,
      promptUsed: prompt,
    };
  } catch (error) {
    console.error("AI execution failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      modelUsed: `${companyName}/${modelName}`,
      promptUsed: prompt,
    };
  }
}
