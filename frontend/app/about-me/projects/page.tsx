import { getPostData } from '../posts';
import styles from './../articleContent.module.css'
import imageStyles from './projectImage.module.css'
import { notFound } from 'next/navigation';

export default async function Page() {
  const postData = await getPostData('projects');
  if (!postData) {
    return notFound();
  }

  const htmlData = postData['contentHtml'];
  return (
    <div dangerouslySetInnerHTML={{__html: htmlData}} className={styles.articleContent + " " + imageStyles.articleContent}></div>
  )
}