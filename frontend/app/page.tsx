'use client'

import { IconLink } from '@/app/icon-link';

export default function Home() {
  return (
    <main className="w-full">
      <div className="text-5xl font-bold flex-col items-center text-center justify-between pt-24">
        Hello, World. This is intermittence.
      </div>
      <div className='flex justify-center items-center'>
        <div className="text-3xl font-bold text-center p-24 w-3/5">
          You can check out the source code used to host to website below. Otherwise, have fun exploring!
        </div>
      </div>
      <div className='flex justify-center'>
        <IconLink description="Link to github repository" imageUrl="/github-mark.png" hrefUrl="https://github.com/knguy22/webnovel-list" />
      </div>
    </main>
  );
}
