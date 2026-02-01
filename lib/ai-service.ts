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
  const AI_REQUEST_TIMEOUT_MS = 180000;

  try {
    const modelId = generateOpenRouterModelId(companyName, modelName, options);

    console.log(`[AI] Executing request with model: ${modelId}`);
    console.log(`[AI] Prompt length: ${prompt.length} characters`);
    console.log(`[AI] Timeout set to: ${AI_REQUEST_TIMEOUT_MS}ms`);

    const startTime = Date.now();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`AI request timed out after ${AI_REQUEST_TIMEOUT_MS}ms`));
      }, AI_REQUEST_TIMEOUT_MS);
    });

    const { text } = await Promise.race([
      generateText({
        model: openrouter(modelId),
        prompt: prompt,
      }),
      timeoutPromise,
    ]);

    const duration = Date.now() - startTime;
    console.log(`[AI] Request completed successfully in ${duration}ms`);

    return {
      success: true,
      content: text,
      modelUsed: modelId,
      promptUsed: prompt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[AI] Execution failed for model ${companyName}/${modelName}: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
      modelUsed: `${companyName}/${modelName}`,
      promptUsed: prompt,
    };
  }
}
