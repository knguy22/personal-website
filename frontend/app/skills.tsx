
const skills_lists: SkillListProps[] = [
    {
        title: "Proficient Languages:",
        skills: ["Python", "Rust", "C++", "JavaScript", "TypeScript", "HTML"],
    },
    {
        title: "Familiar Languages:",
        skills: ["Java", "C", "CSS", "SQL"],
    },
    {
        title: "Frameworks:",
        skills: ["React", "Next.js", "Tailwind", "Django", "Axum"],
    },
]

interface SkillListProps {
  title: string
  skills: string[]
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

export function Skills() {
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