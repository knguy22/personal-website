'use client';
import React, {useState, useEffect} from 'react';
import {NovelEntry, NovelEntryCol, parse_novels, novel_columns, compare_chapter} from '../types/novel_types.tsx';
import {SortByDropdown, SearchBar, NovelsTable} from './client-components.tsx';
import { DataTable } from '@/components/ui/data-table.tsx';
import "./local.css"

export default function Novels() {
  const [isLoading, setLoading] = useState(true);
  const [novels, setNovels] = useState<NovelEntry[] | null>(null);
  const [processed_novels, setProcessedNovels] = useState<NovelEntry[] | null>(null);
  const [isUp, setIsUp] = useState(false);
  const [sort_col, setSortCol] = useState<NovelEntryCol>("rating");
  const [search_content, setSearchContent] = useState<string>("");

  // load raw novels once
  useEffect(() => {
    const fetchNovels = async () => {
      const novels_url = process.env.NEXT_PUBLIC_API_URL + '/novels';
      try {
        const response = await fetch(novels_url);
        const novelsData = await response.json();
        const convertedNovels = parse_novels(novelsData);
        setNovels(convertedNovels);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, []);

  // process the novels every time filters change
  useEffect(() => {
    if (!novels) {
      return;
    }
    let tmp_novels = novels;

    // split the search content into parseable strings
    const cleaned_search_content: String[] = search_content.split(",").filter((content) => content.length > 0);

    // filter the novels
    for (const search_term of cleaned_search_content) {
      tmp_novels = tmp_novels.filter((novel) => {
        // if the content includes a tag:
        if (novel.tags.some((tag) => tag.toLowerCase().includes(search_term.toLowerCase()))) {
          return true;
        }

        // if the content includes a title:
        if (novel.title.toLowerCase().includes(search_term.toLowerCase())) {
          return true;
        }

        // if the content is included in the notes:
        if (novel.notes.toLowerCase().includes(search_term.toLowerCase())) {
          return true;
        }
        return false;
      });
    }

    // sort the novels
    tmp_novels = tmp_novels.sort((a, b) => {
      // if the sort column is "chapter"
      if (sort_col == "chapter") {
        const res = compare_chapter(a[sort_col], b[sort_col]);
        return isUp ? res : -res;
      }

      // always place empty towards bottom
      if (a[sort_col] == "" && b[sort_col] == "") {
        return 0;
      }
      if (a[sort_col] == "") {
        return 1;
      }
      if (b[sort_col] == "") {
        return -1;
      }

      // sort normally
      if (a[sort_col] < b[sort_col]) {
        return isUp ? -1 : 1;
      }
      if (a[sort_col] > b[sort_col]) {
        return isUp ? 1 : -1;
      }
      return 0;
    });

    console.log(tmp_novels.slice(0, 5));

    setProcessedNovels(tmp_novels);
  }, [novels, search_content, sort_col, isUp]);

  if (isLoading) {
    return (<p>Loading...</p>);
  }
  if (!processed_novels || !novels) {
    return (<p>Novels not found...</p>);
  }

  return (
    <>
      <SortByDropdown {...{setIsUp: setIsUp, isUp: isUp, setSortCol: setSortCol}}/>
      <SearchBar {...{setContent: setSearchContent}}/>
      <DataTable columns={novel_columns} data={processed_novels}/>
    </>
  );
};
