import { getPostData } from "./posts"
import './about-me.css'
import { notFound } from 'next/navigation';

export default async function Home() {
  const postData = await getPostData('index');
  if (!postData) {
    return notFound();
  }
  
  const htmlData = postData['contentHtml'];
  return (
    <>
      <div id='articleContent' dangerouslySetInnerHTML={{__html: htmlData}}></div>
    </>
  )
}