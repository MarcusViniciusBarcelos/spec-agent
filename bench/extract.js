export function extractSolution(text) {
  const fence = text.match(/```(?:js|javascript)?\s*([\s\S]*?)```/);
  return (fence ? fence[1] : text).trim();
}
