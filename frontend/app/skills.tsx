export const Languages = {
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
  CMake: "CMake",
  Make: "Make",
  Bash: "Bash",
} as const;
export type Languages = typeof Languages[keyof typeof Languages];

export const Technologies = {
  React: "React",
  Nextjs: "Next.js",
  Tailwind: "Tailwind",
  Django: "Django",
  Axum: "Axum",
  Discordpy: "Discord.py",
  PostgreSQL: "PostgreSQL",
  MySQL: "MySQL",
} as const;
export type Technologies = typeof Technologies[keyof typeof Technologies];

export const Domains = {
  ImageProcessing: "Image Processing",
  AudioProcessing: "Audio Processing",
  MachineLearning: "Machine Learning",
  Multithreading: "Multithreading",
  AlphaBetaPruning: "Alpha-Beta Pruning",
  Hashing: "Hashing",
  Webscraping: "Webscraping",
  Databases: "Databases",
  DataProcessing: "Data Processing",
} as const;
export type Domains = typeof Domains[keyof typeof Domains];
export type Skills = Languages | Technologies | Domains;

const skills_lists: SkillListProps[] = [
  {
      title: "Proficient Languages:",
      skills: ["Python", "Rust", "C++", "JavaScript", "TypeScript"],
  },
  {
      title: "Familiar Languages:",
      skills: ["Java", "C", "SQL", "Bash", "Make", "CMake"],
  },
  {
      title: "Technologies:",
      skills: Object.values(Technologies),
  },
]

interface SkillListProps {
  title: string
  skills: Skills[]
}

function SkillList( {title, skills}: SkillListProps) {
  return (
    <div className="rounded-md outline outline-violet-500 p-5">
      <div className="rounded-md bg-secondary text-base font-bold p-3">{title}</div>
      <div className='justify-between text-base text-left pt-3 space-y-2'>
        {skills.map((skill) => (
          <div key={skill} className="pl-3">{skill}</div>
        ))}
      </div>
    </div>
  )
}

export function SkillsSection() {
  return (
    <div className="w-2/3 mx-auto">
      <div className="text-3xl font-bold flex-col items-center text-center justify-between pt-12 pb-8">
        Skills:
      </div>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-1 gap-5">
        {skills_lists.map((skill_list) => (
          <SkillList key={skill_list.title} title={skill_list.title} skills={skill_list.skills} />
        ))}
      </div>
    </div>
  )
}