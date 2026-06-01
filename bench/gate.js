// regenerate(failureInfo) -> Promise<solution>. Uma iteração de fix (YAGNI).
export async function runGate(solution, checker, regenerate) {
  if (checker(solution)) return { passed: true, gateCaught: false, iterations: 1 };
  const fixed = await regenerate("a solução falhou nos checks; corrija");
  return { passed: checker(fixed), gateCaught: true, iterations: 2 };
}
