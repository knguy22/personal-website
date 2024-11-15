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
        <PreviewLink href="https://github.com/knguy22/webnovel-list" imageLink="/github-mark.png" alt="Link to github repository" name="Source Code" />
        <PreviewLink href="https://github.com/knguy22/webnovel-list" imageLink="/linkedin-pfp-tetris.png" alt="Link to github repository" name="Source Code" />
        <PreviewLink href="https://github.com/knguy22/webnovel-list" imageLink="/github-mark.png" alt="Link to github repository" name="Source Code" />
      </div>
      <div className="flex justify-center space-x-16 pt-16">
        <IconLink description="Link to github repository" imageUrl="/github-mark.png" hrefUrl="https://github.com/knguy22/webnovel-list" />
      </div>
    </main>
  );
}

interface PreviewLinkProps {
  href: string,
  imageLink: string,
  alt: string,
  name: string
}

function PreviewLink( {href, imageLink, alt, name } : PreviewLinkProps ) {
  return (
    <div>
      <Link href={href} className='imageIconLink'>
        <Image
          src={imageLink}
          width={200}
          height={200}
          alt={alt}
        />
        <div className='text-center pt-3'>{name}</div>
      </Link>
    </div>
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