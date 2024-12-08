
const Languages = {
  Python: "Python",
  Rust: "Rust",
  Cplusplus: "C++",
  JavaScript: "JavaScript",
  TypeScript: "TypeScript",
  HTML: "HTML",
  Java: "Java",
  C: "C",
  CSS: "CSS",
  SQL: "SQL",
} as const;

const Frameworks = {
  React: "React",
  Nextjs: "Next.js",
  Tailwind: "Tailwind",
  Django: "Django",
  Axum: "Axum",
} as const;

export type Technologies = typeof Languages[keyof typeof Languages] | typeof Frameworks[keyof typeof Frameworks];
