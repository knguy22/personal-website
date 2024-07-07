'use client'

import Image from 'next/image';
import Link from 'next/link';

interface IconLinkProps {
  description: string
  imageUrl: string
  hrefUrl: string
}

export function IconLink( {description, imageUrl, hrefUrl} : IconLinkProps ) {
  return (
    <Link href={hrefUrl} className='imageIconLink'>
      <Image
        src={imageUrl}
        width={150}
        height={150}
        alt={description}
        className='imageIcon' />
    </Link>
  )
}