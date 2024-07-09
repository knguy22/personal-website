import { getPostData } from "./posts"
import { notFound } from 'next/navigation';
import './about-me.css'
import './about-me-local.css'

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