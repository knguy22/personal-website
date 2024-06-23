'use client';

import React, {useState, useEffect} from 'react';
import {NovelEntry, create_chapter, format_chapter} from '../types/novel_types.tsx';

export function NovelsTable() {
  const [novels, setNovels] = useState<NovelEntry[] | null>(null);
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const novels_url = process.env.NEXT_PUBLIC_API_URL + '/api/novels';
    fetch(novels_url)
      .then(response => response.json())
      .then(novels => convert_novels(novels))
      .then(novels => {
        setNovels(novels);
        setLoading(false)
    })
  }, []);

  if (isLoading) {
    return (<p>Loading...</p>);
  }
  if (!novels) {
    return (<p>Novels not found...</p>);
  }

  return (
    <>
    <SortByDropdown {...{isUp: true}}/>
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
    </>
  );
};

function convert_novels(novels: NovelEntry[]): NovelEntry[] {
  return novels.map((novel: NovelEntry) => ({
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

type SortByDropdownProps = {
  isUp: boolean
}

export function SortByDropdown({isUp}: SortByDropdownProps) {
  return (
    <>
      <select>
        <option value="country">Country</option>
        <option value="title">Title</option>
        <option value="chapter">Chapter</option>
        <option value="rating">Rating</option>
        <option value="status">Status</option>
        <option value="tags">Tags</option>
        <option value="notes">Notes</option>
        <option value="date_modified">Date Modified</option>
      </select>
      <button type="submit">{isUp ? "↑" : "↓"}</button>
    </>
  )
}