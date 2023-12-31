import { getPostData } from "@/lib/posts"

export default async function education() {
    const postData = await getPostData('education');
    const htmlData = postData['contentHtml'];
    return (
        <div id='articleContent' dangerouslySetInnerHTML={{__html: htmlData}}></div>
    )
}
