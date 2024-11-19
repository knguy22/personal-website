import Link from 'next/link';

const PreviewsKey = {
  ImageToTetris: "ImageToTetris",
  BlockyChessEngine: "BlockyChessEngine",
  JstrisStatisticsDiscordBot: "JstrisStatisticsDiscordBot",
  WebnovelList: "WebnovelList",
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
    href: "https://github.com/knguy22/personal-website",
    imageLink: "/webnovels-list.png",
    alt: "Webnovel List",
  },
};

interface PreviewsProps {
  previewKey: keyof typeof PreviewsKey
}

export function PreviewLink( { previewKey } : PreviewsProps ) {
  const preview = preview_info[previewKey];
  return (
    <Link href={preview.href} className='flex flex-col items-center'>
      <img src={preview.imageLink} alt={preview.alt} className='h-52 w-52 object-cover'></img>
      <div className='text-center text-xl pt-6 w-52'>{preview.name}</div>
    </Link>
  )
}
