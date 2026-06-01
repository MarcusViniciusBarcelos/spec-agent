// checker(solution: string) -> boolean. Roda a solução em sandbox (new Function),
// aplica testes OCULTOS (não vão no prompt). O agente nunca vê o checker.
function loadFn(solution, name) {
  // eslint-disable-next-line no-new-func
  const factory = new Function(`${solution}; return typeof ${name} === "function" ? ${name} : undefined;`);
  return factory();
}
function safe(fn) {
  try {
    return fn() === true;
  } catch {
    return false;
  }
}

export const TASKS = [
  {
    id: "sum",
    kind: "control",
    prompt: "Escreva `function sum(a, b)` que retorna a soma de dois números. Responda só o código.",
    solutionContract: "function sum(a, b)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "sum");
        return f(2, 3) === 5 && f(-1, 1) === 0;
      }),
  },
  {
    id: "avg-empty",
    kind: "targeted",
    prompt:
      "Escreva `function avg(xs)` que retorna a média de uma lista de números, e 0 para lista vazia. Responda só o código.",
    solutionContract: "function avg(xs)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "avg");
        return f([2, 4]) === 3 && f([]) === 0; // footgun: naive faz NaN em []
      }),
  },
  {
    id: "slug",
    kind: "targeted",
    prompt:
      "Escreva `function slug(s)` que baixa caixa, troca espaços por '-', remove tudo que não for [a-z0-9-]. Responda só o código.",
    solutionContract: "function slug(s)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "slug");
        return f("Ola Mundo!") === "ola-mundo" && f("A  B") === "a--b";
      }),
  },
  {
    id: "is-even",
    kind: "control",
    prompt: "Escreva `function isEven(n)` que retorna true se n é par. Responda só o código.",
    solutionContract: "function isEven(n)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "isEven");
        return f(4) === true && f(3) === false;
      }),
  },
  {
    id: "clamp",
    kind: "control",
    prompt: "Escreva `function clamp(n, lo, hi)` que limita n ao intervalo [lo, hi]. Responda só o código.",
    solutionContract: "function clamp(n, lo, hi)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "clamp");
        return f(5, 0, 10) === 5 && f(-1, 0, 10) === 0 && f(99, 0, 10) === 10;
      }),
  },
  {
    id: "unique",
    kind: "targeted",
    prompt:
      "Escreva `function unique(xs)` que retorna os elementos sem duplicatas PRESERVANDO a ordem da primeira ocorrência. Responda só o código.",
    solutionContract: "function unique(xs)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "unique");
        return JSON.stringify(f([3, 1, 3, 2, 1])) === "[3,1,2]"; // footgun: dedup via sort quebra a ordem
      }),
  },
  {
    id: "parse-amount",
    kind: "targeted",
    prompt:
      "Escreva `function parseAmount(s)` que recebe uma string como ' 12 ' e retorna o número 12; para string vazia ou só espaços retorna 0. Responda só o código.",
    solutionContract: "function parseAmount(s)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "parseAmount");
        return f(" 12 ") === 12 && f("") === 0 && f("   ") === 0; // footgun: parseInt("") === NaN sem guard
      }),
  },
  {
    id: "title-case",
    kind: "control",
    prompt: "Escreva `function titleCase(s)` que deixa a primeira letra de cada palavra maiúscula. Responda só o código.",
    solutionContract: "function titleCase(s)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "titleCase");
        return f("hello world") === "Hello World";
      }),
  },
  {
    id: "last",
    kind: "targeted",
    prompt:
      "Escreva `function last(xs)` que retorna o último elemento de uma lista (sem mutar a lista), e undefined para lista vazia. Responda só o código.",
    solutionContract: "function last(xs)",
    checker: (sol) =>
      safe(() => {
        const f = loadFn(sol, "last");
        const arr = [1, 2, 3];
        return f(arr) === 3 && arr.length === 3 && f([]) === undefined; // footgun: xs.pop() muta a lista
      }),
  },
];
