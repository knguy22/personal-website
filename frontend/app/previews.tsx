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
    alt: string
}

const preview_info: Record<string, PreviewsValue> = {
  ImageToTetris: {
    name: "Image To Tetris",
    href: "https://github.com/knguy22/image-to-tetris",
    imageLink: "/linkedin-pfp-tetris.png",
    alt: "Image To Tetris",
  },
  BlockyChessEngine: {
    name: "Blocky Chess Engine",
    href: "https://github.com/knguy22/blocky-chess-engine",
    imageLink: "/blocky-chess-game.png",
    alt: "Blocky Chess Engine",
  },
  JstrisStatisticsDiscordBot: {
    name: "Jstris Statistics Discord Bot",
    href: "https://github.com/knguy22/Jstris-Stats-Discord-Bot",
    imageLink: "/badgerbot-gametime.png",
    alt: "Jstris Statistics Discord Bot",
  },
  WebnovelList: {
    name: "Webnovel List",
    href: process.env.NEXT_PUBLIC_URL + "/novels/novels-stats",
    imageLink: "/webnovels-list.png",
    alt: "Webnovel List",
  },
  PersonalWebsite: {
    name: "This Personal Website",
    href: "https://github.com/knguy22/personal-website",
    imageLink: "/wizard.png",
    alt: "This Personal Website",
  },
};

interface PreviewsProps {
  previewKey: keyof typeof PreviewsKey
}

export function PreviewLink( { previewKey } : PreviewsProps ) {
  console.log(preview_info)
  const preview = preview_info[previewKey];
  return (
    <Link href={preview.href} className='flex flex-col justify-center items-center w-64 h-64 rounded-md outline outline-violet-400 transition-colors 
        hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none 
        disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50'>
      <img src={preview.imageLink} alt={preview.alt} className='h-40 w-40 object-cover'></img>
      <div className='text-center text-lg pt-4 w-48'>{preview.name}</div>
    </Link>
  )
}
