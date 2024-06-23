import React from 'react'
import {NovelEntry, create_chapter} from '../types/novel_types.tsx';
import {NovelEntryRow} from './components.tsx';
import "./local.css"

export default async function novels() {
  const data: JSON[] = await fetch_novels();
  const novels: NovelEntry[] = data.map((novel: any) => ({
    country: novel.country,
    title: novel.title,
    chapter: create_chapter(novel.chapter),
    rating: novel.rating,
    status: novel.status,
    tags: novel.tags,
    notes: novel.notes,
    date_modified: novel.date_modified
  }));

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

async function fetch_novels(): Promise<JSON[]> {
  const response: Response = await fetch('http://127.0.0.1:3000/novels');
  if (!response.ok) {
    throw new Error('Failed to fetch novels');
  }
  return await response.json();
}