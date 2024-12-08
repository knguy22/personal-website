import Image from 'next/image';
import Link from 'next/link';

interface IconLinkProps {
  description: string
  imageUrl: string
  hrefUrl: string
  width: number
  height: number
}

export function IconLink({ description, imageUrl, hrefUrl, width, height } : IconLinkProps) {
  return (
    <Link href={hrefUrl} className='transition ease-in-out hover:scale-110'>
      <Image
        src={imageUrl}
        width={width}
        height={height}
        alt={description}
      />
    </Link>
  )
}