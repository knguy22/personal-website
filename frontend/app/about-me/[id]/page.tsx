import { getPostData } from '../posts';
import styles from './../articleContent.module.css'
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const postData = await getPostData(params.id);
  if (!postData) {
    return notFound();
  }

  const htmlData = postData['contentHtml'];
  return (
    <div dangerouslySetInnerHTML={{__html: htmlData}} className={styles.articleContent}></div>
  )
}