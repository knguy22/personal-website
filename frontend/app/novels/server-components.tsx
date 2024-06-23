import {NovelEntry, create_chapter, format_chapter} from '../types/novel_types.tsx';

export async function NovelsTable() {
  const novels = await fetch_novels();
  return (
    <table>
    <thead>
        <tr>
        <th>Country</th>
        <th>Title</th>
        <th>Chapter</th>
        <th>Rating</th>
        <th>Status</th>
        <th>Tags</th>
        <th>Notes</th>
        <th>Date Modified</th>
        </tr>
    </thead>
    <tbody>
        {novels.map((novel: NovelEntry, index: number) => (
        <NovelEntryRow key={index} novel={novel}/>
        ))}
    </tbody>
    </table>
  );
};

async function fetch_novels(): Promise<NovelEntry[]> {
  const response: Response = await fetch(process.env.API_URL + '/api/novels');
  if (!response.ok) {
    throw new Error('Failed to fetch novels');
  }
  const data: NovelEntry[] = await response.json();
  return data.map((novel: NovelEntry) => ({
    country: novel.country,
    title: novel.title,
    chapter: create_chapter(novel.chapter),
    rating: novel.rating,
    status: novel.status,
    tags: novel.tags,
    notes: novel.notes,
    date_modified: novel.date_modified
  }));
}

type NovelEntryRowProps = {
  novel: NovelEntry;
};

export function NovelEntryRow({ novel}: NovelEntryRowProps) {
    return (
        <tr>
        <td>{novel.country}</td>
        <td>{novel.title}</td>
        <td>{format_chapter(novel.chapter)}</td>
        <td>{String(novel.rating)}</td>
        <td>{novel.status}</td>
        <td>{novel.tags.join(',')}</td>
        <td>{novel.notes}</td>
        <td>{String(novel.date_modified)}</td>
        </tr>
    )
}
