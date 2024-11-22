'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Projects } from './projects.tsx';
import { Skills } from './skills.tsx';


export default function Page() {
  return (
    <main className="w-full">
      <div className="text-5xl font-bold flex-col items-center text-center justify-between pt-14">
        {"Hi, I'm Intermittence!"}
      </div>
      <Intro />
      <Projects />
      <Skills />
      <Socials />
    </main>
  );
}

function Intro() {
  return (
    <div className="text-lg flex flex-col justify-between w-1/2 pt-12 space-y-3 mx-auto">
      <div className='text-3xl font-bold text-center pb-4'>About Me:</div>
      <div>
        {"I'm a computer science student who likes creating programs to solve interesting problems."}
      </div>
      <div>
        {"My work has spanned multiple domains including image manipulation, audio processing, and machine learning. I plan\
        on continuing to expand my knowledge in these areas and more."}
      </div>
    </div>
  )
}

function Socials() {
  return (
    <div className='flex flex-col items-center'>
      <div className="text-2xl font-bold flex-col items-center text-center justify-between pt-12">
        Check me out or contact me:
      </div>
      <div className="flex justify-center space-x-16 pt-12">
        <IconLink description="Link to github profile" imageUrl="/icons/github-mark.png" hrefUrl="https://github.com/knguy22" />
        <IconLink description="Link to linkedin profile" imageUrl="/icons/linkedin.png" hrefUrl="https://www.linkedin.com/in/kevin-nguyen-89326a242/" />
      </div>
      <div className="flex justify-center flex-col text-center space-y-2 pt-10 pb-12 text-lg">
        <div>Discord: @intermittence</div>
        <div>Email: kevinngguyen1@gmail.com</div>
      </div>
    </div>
  )
}

interface IconLinkProps {
  description: string
  imageUrl: string
  hrefUrl: string
}

function IconLink( {description, imageUrl, hrefUrl } : IconLinkProps ) {
  return (
    <Link href={hrefUrl}> 
      <Image
        src={imageUrl}
        width={100}
        height={100}
        alt={description}
      />
    </Link>
  )
}