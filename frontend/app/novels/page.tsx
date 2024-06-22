import Image from "next/image";
import React from 'react'
import "./local.css"

type NovelEntry = {
    country: String,
    title: String,
    chapter: JSON,
    rating: Number,
    status: String,
    tags: String,
    notes: String,
    date_modified: Date,
}

export default async function novels() {
  const data: JSON[] = await fetch_novels();
  const novels: NovelEntry[] = data.map((novel: any) => ({
    country: novel.country,
    title: novel.title,
    chapter: novel.chapter,
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
          <tr key={index}>
            <td>{novel.country}</td>
            <td>{novel.title}</td>
            <td>{JSON.stringify(novel.chapter)}</td>
            <td>{String(novel.rating)}</td>
            <td>{novel.status}</td>
            <td>{novel.tags}</td>
            <td>{novel.notes}</td>
            <td>{String(novel.date_modified)}</td>
          </tr>
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