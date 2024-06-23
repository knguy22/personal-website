'use client';

import React, {useState, useEffect} from 'react';
import {NovelEntry, NovelEntryCol, compare_chapter, format_chapter, parse_novels} from '../types/novel_types.tsx';

export function ClientPage() {
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

type NovelsTableProps = {
  isUp: boolean,
  novels: NovelEntry[],
  sort_col: NovelEntryCol,
  search_content: string,
  tags: String[]
}

function NovelsTable({isUp, novels, sort_col, search_content, tags}: NovelsTableProps) {
  // split the search content into parseable strings
  const cleaned_search_content: String[] = search_content.split(",").filter((content) => content.length > 0);

  // filter the novels
  for (const search_term of cleaned_search_content) {
    novels = novels.filter((novel) => {
      // if the content includes a tag:
      if (novel.tags.some((tag) => tag.toLowerCase().includes(search_term.toLowerCase()))) {
        return true;
      }

      // if the content includes a title:
      if (novel.title.toLowerCase().includes(search_term.toLowerCase())) {
        return true;
      }
      return false;
    });
  }

  // check sort_col is valid
  if (novels.length == 0) {
    console.log("No novels found"); 
  } else if (!(sort_col in novels[0])) {
    console.log("Invalid sort column: ", sort_col);
  } else {
    console.log("Valid sort column: ", sort_col);
  }
  console.log("Is up: ", isUp);

  // sort the novels
  const sorted_novels = novels.sort((a, b) => {
    if (sort_col == "chapter") {
      const res = compare_chapter(a[sort_col], b[sort_col]);
      return isUp ? res : -res;
    }

    if (a[sort_col] < b[sort_col]) {
      return isUp ? -1 : 1;
    }
    if (a[sort_col] > b[sort_col]) {
      return isUp ? 1 : -1;
    }
    return 0;
  });

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
      {sorted_novels.map((novel: NovelEntry, index: number) => (
      <NovelEntryRow key={index} novel={novel}/>
      ))}
    </tbody>
    </table>
  );
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
        <td>{novel.tags.join(',\n')}</td>
        <td>{novel.notes}</td>
        <td>{String(novel.date_modified)}</td>
        </tr>
    )
}

type SortByDropdownProps = {
  setIsUp: React.Dispatch<React.SetStateAction<boolean>>,
  isUp: boolean,
  setSortCol: React.Dispatch<React.SetStateAction<NovelEntryCol>>,
}

export function SortByDropdown({setIsUp, isUp, setSortCol}: SortByDropdownProps) {
  return (
    <>
      <select 
        onChange={(e) => setSortCol(e.target.value as NovelEntryCol)}
        // defaultValue={"rating"}
      >
        <option value="country">Country</option>
        <option value="title">Title</option>
        <option value="chapter">Chapter</option>
        <option value="rating">Rating</option>
        <option value="status">Status</option>
        <option value="tags">Tags</option>
        <option value="notes">Notes</option>
        <option value="date_modified">Date Modified</option>
      </select>
      <button 
        onClick={() => setIsUp(!isUp)}
        type="submit">{isUp ? "↑" : "↓"}
      </button>
    </>
  );
}

type SearchBarProps = {
  setContent: React.Dispatch<React.SetStateAction<string>>,
}

export function SearchBar({setContent}: SearchBarProps) {
  return (
    <input 
      type="text" 
      placeholder="Search By Params"
      onChange={(e) => setContent(e.target.value)}
    />
  );
}