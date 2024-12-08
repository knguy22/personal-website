import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DialogTitle,
  DialogDescription
} from "@radix-ui/react-dialog";

import { IconLink } from './icon-link';
import { Languages, Technologies, Domains, Skills } from "./skills";

const ProjectsKey = {
  ImageToTetris: "ImageToTetris",
  BlockyChessEngine: "BlockyChessEngine",
  JstrisStatisticsDiscordBot: "JstrisStatisticsDiscordBot",
  PersonalWebsite: "PersonalWebsite",
} as const;

type ProjectsValue = {
  name: string,
  href: string,
  imageLink: string,
  alt: string,
  desc: string,
  languages?: Languages[],
  technologies?: Technologies[],
  domains?: Domains[],
}

const project_info: Record<string, ProjectsValue> = {
  ImageToTetris: {
    name: "Image To Tetris",
    href: "https://github.com/knguy22/image-to-tetris",
    imageLink: "/project_images/linkedin-pfp-tetris.png",
    alt: "Image To Tetris",
    desc: "A tool to efficiently convert images and videos into valid Tetris configurations. An audio to tetris audio clips approximator \
    is also a WIP.",
    languages: ["Rust", "Python"],
    domains: ["Image Processing", "Audio Processing", "Multithreading"],
  },
  BlockyChessEngine: {
    name: "Blocky Chess Engine",
    href: "https://github.com/knguy22/blocky-chess-engine",
    imageLink: "/project_images/blocky-chess-game.png",
    alt: "Blocky Chess Engine",
    desc: "A program that plays chess at a high level. It does so using specialized search algorithms and an evaluation function \
    trained using machine learning.",
    languages: ["C++", "CMake"],
    technologies: ["GoogleTest"],
    domains: ["Machine Learning", "Alpha-Beta Pruning", "Hashing", "Data Processing"],
  },
  JstrisStatisticsDiscordBot: {
    name: "Jstris Statistics Discord Bot",
    href: "https://github.com/knguy22/Jstris-Stats-Discord-Bot",
    imageLink: "/project_images/badgerbot-gametime.png",
    alt: "Jstris Statistics Discord Bot",
    desc: "A Discord bot that provides Jstris statistics for competitive Tetris players.",
    languages: ["Python"],
    domains: ["Webscraping", "Data Processing"],
  },
  PersonalWebsite: {
    name: "This Personal Website",
    href: "https://github.com/knguy22/personal-website",
    imageLink: "/project_images/wizard.png",
    alt: "This Personal Website",
    desc: "A website that I can call my own. This currently hosts my portfolio and my webnovel list, which \
    keeps track of my webnovels I have read and their corresponding statistics.",
    languages: ["TypeScript", "JavaScript", "Rust"],
    technologies: ["React", "Next.js", "Tailwind", "Axum", "PostgreSQL"],
    domains: ["Databases", "Data Processing"],
  },
};

interface ThumbnailProps {
  project: ProjectsValue
}

function Thumbnail({ project } : ThumbnailProps) {
  return (
    <div className='rounded-md outline outline-violet-500 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50'>
      <div className='flex flex-col justify-center items-center py-6'>
        <picture>
          <img src={project.imageLink} alt={project.alt} className='h-40 w-40 object-cover'></img>
        </picture>
        <div className='text-center text-lg pt-4 w-full'>{project.name}</div>
      </div>
    </div>
  )
}

interface ProjectSkillsListProps {
  title: string
  skills?: Skills[]
}

function ProjectSkillsList({ title, skills } : ProjectSkillsListProps) {
  if (skills === undefined) {
    return (
      <></>
    )
  }

  return (
    <div>
      <div className='font-bold mb-1'>{title}</div>
      <ul className="list-disc pl-3">
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </div>
  )
}


interface ProjectContentProps {
  project: ProjectsValue
}

function ProjectContent({ project } : ProjectContentProps) {
  return (
    <div className='flex flex-col justify-center items-center space-y-2'>
      <picture>
        <img src={project.imageLink} alt={project.alt} className='h-40 w-40 object-cover'></img>
      </picture>
      <DialogTitle className='text-center text-lg w-full'>{project.name}</DialogTitle>
      <DialogDescription className='text-sm w-4/5 pt-3'>{project.desc}</DialogDescription>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-y-2 py-3 w-4/5 text-sm text-left'>
        <ProjectSkillsList title="Languages:"  skills={project.languages} />
        <ProjectSkillsList title="Technologies:" skills={project.technologies} />
        <ProjectSkillsList title="Domains:" skills={project.domains} />
      </div>

      <IconLink 
        description="Link to project" 
        imageUrl="/icons/github-mark.png" 
        hrefUrl={project.href}
        width={60}
        height={60}
      />
    </div>
  )
}

export function Projects() {
  return (
    <div className='w-2/3 mx-auto'>
      <div className="text-3xl font-bold flex-col items-center text-center justify-between pt-12">
        Projects:
      </div>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-1 gap-5 pt-10">
        {Object.values(ProjectsKey).map((projectKey) => (
          <Dialog key={projectKey}>
            <DialogTrigger>
              <Thumbnail project={project_info[projectKey]} />
            </DialogTrigger>
            <DialogContent>
              <ProjectContent project={project_info[projectKey]} />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
