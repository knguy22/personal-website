import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconLink } from './icon-link';
import { Technologies } from "./technologies";

const ProjectsKey = {
  ImageToTetris: "ImageToTetris",
  BlockyChessEngine: "BlockyChessEngine",
  JstrisStatisticsDiscordBot: "JstrisStatisticsDiscordBot",
  WebnovelList: "WebnovelList",
  PersonalWebsite: "PersonalWebsite",
} as const;

type ProjectsValue = {
  name: string,
  href: string,
  imageLink: string,
  alt: string,
  desc: string,
  techs: Technologies[],
}

const project_info: Record<string, ProjectsValue> = {
  ImageToTetris: {
    name: "Image To Tetris",
    href: "https://github.com/knguy22/image-to-tetris",
    imageLink: "/project_images/linkedin-pfp-tetris.png",
    alt: "Image To Tetris",
    desc: "A tool to efficiently convert images and videos into valid Tetris configurations. An audio to tetris audio clips approximator \
    is also a WIP.",
    techs: ["Rust", "Python"],
  },
  BlockyChessEngine: {
    name: "Blocky Chess Engine",
    href: "https://github.com/knguy22/blocky-chess-engine",
    imageLink: "/project_images/blocky-chess-game.png",
    alt: "Blocky Chess Engine",
    desc: "A program that plays chess at a high level and improve itself using training data from previous games.",
    techs: ["C++"],
  },
  JstrisStatisticsDiscordBot: {
    name: "Jstris Statistics Discord Bot",
    href: "https://github.com/knguy22/Jstris-Stats-Discord-Bot",
    imageLink: "/project_images/badgerbot-gametime.png",
    alt: "Jstris Statistics Discord Bot",
    desc: "A Discord bot that provides Jstris statistics for competitive Tetris players.",
    techs: ["Python"],
  },
  WebnovelList: {
    name: "Webnovel List",
    href: "/novels/novels-list",
    imageLink: "/project_images/webnovels-list.png",
    alt: "Webnovel List",
    desc: "A tool to keep track of webnovels I've read and visualizing relevant statistics.",
    techs: ["Rust", "TypeScript", "React", "HTML", "CSS", "Tailwind", "Next.js", "Axum"],
  },
  PersonalWebsite: {
    name: "This Personal Website",
    href: "https://github.com/knguy22/personal-website",
    imageLink: "/project_images/wizard.png",
    alt: "This Personal Website",
    desc: "A sandbox for me to try out new things. Currently hosts my portfolio and my webnovel list.",
    techs: ["Rust", "TypeScript", "React", "HTML", "CSS", "Tailwind", "Next.js", "Axum"],
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

interface ProjectContentProps {
  project: ProjectsValue
}

function ProjectContent({ project } : ProjectContentProps) {
  return (
    <div className='flex flex-col justify-center items-center space-y-2'>
      <picture>
        <img src={project.imageLink} alt={project.alt} className='h-40 w-40 object-cover'></img>
      </picture>
      <div className='text-center text-lg w-full'>{project.name}</div>
      <div className='text-sm w-3/5 pt-4'>{project.desc}</div>
      <div className='text-sm text-left pt-3 space-y-1 w-3/5'>
        {project.techs.map((tech) => (
          <div key={tech}>{tech}</div>
        ))}
      </div>

      <IconLink 
        description="Link to project" 
        imageUrl="/icons/github-mark.png" 
        hrefUrl={project.href}
        width={50}
        height={50}
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
