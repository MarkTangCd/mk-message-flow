export interface ModelIdOptions {
  useOnline?: boolean;
}

export function generateOpenRouterModelId(
  companyName: string,
  modelName: string,
  options?: ModelIdOptions
): string {
  const baseId = `${companyName}/${modelName}`;
  const useOnline = options?.useOnline ?? process.env.USE_ONLINE_MODE === "true";

  if (useOnline) {
    return `${baseId}:online`;
  }

  return baseId;
}
