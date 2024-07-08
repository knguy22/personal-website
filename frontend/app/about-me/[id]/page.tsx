import { getPostData } from '../posts';
import '../about-me.css'
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
    const postData = await getPostData(params.id);
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