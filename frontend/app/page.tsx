'use client'

import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <main className="w-full">
      <div className="text-5xl font-bold flex-col items-center text-center justify-between pt-24">
        intermittence.dev
      </div>
      <div className="flex justify-center space-x-16 pt-12">
        <PreviewLink name="Image To Tetris" href="https://github.com/knguy22/image-to-tetris" imageLink="/linkedin-pfp-tetris.png" alt="" />
        <PreviewLink name="Blocky Chess Engine" href="https://github.com/knguy22/blocky-chess-engine" imageLink="/blocky-chess-game.png" alt="" />
        <PreviewLink name="Jstris Statistics Discord Bot" href="https://github.com/knguy22/Jstris-Stats-Discord-Bot" imageLink="/badgerbot-gametime.png" alt="" />
      </div>
      <div className="flex justify-center space-x-16 pt-16">
        <IconLink description="Link to github repository" imageUrl="/github-mark.png" hrefUrl="https://github.com/knguy22/webnovel-list" />
      </div>
    </main>
  );
}

interface PreviewLinkProps {
  name: string
  href: string,
  imageLink: string,
  alt: string,
}

function PreviewLink( { name, href, imageLink, alt } : PreviewLinkProps ) {
  return (
    <Link href={href} className='flex flex-col items-center'>
      <img src={imageLink} alt={alt} className='h-52 w-52 object-cover'></img>
      <div className='text-center text-xl pt-6 w-52'>{name}</div>
    </Link>
  )
}

interface IconLinkProps {
  description: string
  imageUrl: string
  hrefUrl: string
}

export function IconLink( {description, imageUrl, hrefUrl } : IconLinkProps ) {
  return (
    <Link href={hrefUrl} className='imageIconLink'>
      <Image
        src={imageUrl}
        width={50}
        height={50}
        alt={description}
      />
    </Link>
  )
}