'use client';
import React, {useState, useEffect} from 'react';
import {NovelEntry, NovelEntryCol, parse_novels} from '../types/novel_types.tsx';
import {SortByDropdown, SearchBar, NovelsTable} from './client-components.tsx';
import "./local.css"

export default function Novels() {
  const [isLoading, setLoading] = useState(true);
  const [novels, setNovels] = useState<NovelEntry[] | null>(null);
  const [isUp, setIsUp] = useState(false);
  const [sort_col, setSortCol] = useState<NovelEntryCol>("rating");
  const [search_content, setSearchContent] = useState<string>("");
  const [tags, setTags] = useState<String[]>([]);

  // load novels once
  useEffect(() => {
    const fetchNovels = async () => {
      const novels_url = process.env.NEXT_PUBLIC_API_URL + '/novels';
      try {
        const response = await fetch(novels_url);
        const novelsData = await response.json();
        const convertedNovels = parse_novels(novelsData);
        setNovels(convertedNovels);
        setTags(convertedNovels.map((novel) => novel.tags).flat());
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, []);

  if (isLoading) {
    return (<p>Loading...</p>);
  }
  if (!novels) {
    return (<p>Novels not found...</p>);
  }

  return (
    <>
      <SortByDropdown {...{setIsUp: setIsUp, isUp: isUp, setSortCol: setSortCol}}/>
      <SearchBar {...{setContent: setSearchContent}}/>
      <NovelsTable {...{isUp: isUp, novels: novels, sort_col: sort_col, search_content: search_content, tags: tags}}/>
    </>
  );
};
