import Link from 'next/link';

const PreviewsKey = {
  ImageToTetris: "ImageToTetris",
  BlockyChessEngine: "BlockyChessEngine",
  JstrisStatisticsDiscordBot: "JstrisStatisticsDiscordBot",
  WebnovelList: "WebnovelList",
  PersonalWebsite: "PersonalWebsite",
} as const;

type PreviewsValue = {
    name: string,
    href: string,
    imageLink: string,
    alt: string,
    desc: string,
}

const preview_info: Record<string, PreviewsValue> = {
  ImageToTetris: {
    name: "Image To Tetris",
    href: "https://github.com/knguy22/image-to-tetris",
    imageLink: "/linkedin-pfp-tetris.png",
    alt: "Image To Tetris",
    desc: "A tool to efficiently convert images and videos into valid tetris configurations.",
  },
  BlockyChessEngine: {
    name: "Blocky Chess Engine",
    href: "https://github.com/knguy22/blocky-chess-engine",
    imageLink: "/blocky-chess-game.png",
    alt: "Blocky Chess Engine",
    desc: "A program that plays chess at a high level and improve itself using training data from previous games.",
  },
  JstrisStatisticsDiscordBot: {
    name: "Jstris Stats Discord Bot",
    href: "https://github.com/knguy22/Jstris-Stats-Discord-Bot",
    imageLink: "/badgerbot-gametime.png",
    alt: "Jstris Statistics Discord Bot",
    desc: "A discord bot that provides Jstris statistics for competitive Tetris players.",
  },
  WebnovelList: {
    name: "Webnovel List",
    href: "/novels/novels-stats",
    imageLink: "/webnovels-list.png",
    alt: "Webnovel List",
    desc: "A tool to keep track of webnovels I've read and visualizing relevant statistics.",
  },
  PersonalWebsite: {
    name: "This Personal Website",
    href: "https://github.com/knguy22/personal-website",
    imageLink: "/wizard.png",
    alt: "This Personal Website",
    desc: "A sandbox for me to try out new things. Currently hosts my portfolio and my webnovel list.",
  },
};

interface PreviewsProps {
  previewKey: keyof typeof PreviewsKey
}

export function PreviewLink( { previewKey } : PreviewsProps ) {
  const preview = preview_info[previewKey];
  return (
    <Link href={preview.href} className='rounded-md outline outline-violet-500 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50'>
        <div className='flex flex-col justify-center items-center py-6'>
            <picture>
                <img src={preview.imageLink} alt={preview.alt} className='h-40 w-40 object-cover'></img>
            </picture>
            <div className='text-center text-lg pt-4 w-full'>{preview.name}</div>
            <div className='text-center text-sm pt-4 w-4/5'>{preview.desc}</div>
        </div>
    </Link>
  )
}
