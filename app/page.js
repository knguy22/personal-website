import { getPostData } from "@/lib/posts"

export default async function Home() {
  const postData = await getPostData('index');
  const htmlData = postData['contentHtml'];
  return (
    <>
      <div id='articleContent' dangerouslySetInnerHTML={{__html: htmlData}}></div>
    </>
  )
}

