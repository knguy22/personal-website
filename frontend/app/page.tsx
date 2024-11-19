'use client'

import Image from 'next/image';
import Link from 'next/link';
import { PreviewLink } from './previews.tsx';

export default function Page() {
  return (
    <main className="w-full">
      <div className="text-5xl font-bold flex-col items-center text-center justify-between pt-14">
        Hi, I'm Intermittence!
      </div>
      <div className="text-2xl font-bold flex-col items-center text-center justify-between pt-12">
        I also go by Kevin, and I like making cool stuff.<br/>
        Here is some of the work I've done and am proud of:
      </div>
      <div className="flex justify-center space-x-16 pt-10">
        <PreviewLink previewKey="ImageToTetris" />
        <PreviewLink previewKey="BlockyChessEngine" />
      </div>
      <div className="flex justify-center space-x-16 pt-10">
        <PreviewLink previewKey="JstrisStatisticsDiscordBot" />
        <PreviewLink previewKey="WebnovelList" />
      </div>
      <div className="flex justify-center space-x-16 pt-10">
        <PreviewLink previewKey="PersonalWebsite" />
      </div>
      <div className="flex justify-center space-x-16 pt-16">
        <IconLink description="Link to github repository" imageUrl="/github-mark.png" hrefUrl="https://github.com/knguy22/webnovel-list" />
      </div>
    </main>
  );
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