import { getPostData } from "./posts"
import { notFound } from 'next/navigation';
import styles from './articleContent.module.css'

export default async function Home() {
  const postData = await getPostData('index');
  if (!postData) {
    return notFound();
  }
  
  const htmlData = postData['contentHtml'];
  return (
    <div dangerouslySetInnerHTML={{__html: htmlData}} className={styles.articleContent}></div>
  )
}