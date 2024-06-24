'use client';

import {NovelEntry, NovelEntryCol, compare_chapter, format_chapter} from '../types/novel_types.tsx';

type NovelsTableProps = {
  isUp: boolean,
  novels: NovelEntry[],
  sort_col: NovelEntryCol,
  search_content: string,
  tags: String[]
}

export function NovelsTable({isUp, novels, sort_col, search_content, tags}: NovelsTableProps) {
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

function NovelEntryRow({ novel}: NovelEntryRowProps) {
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
        defaultValue={"rating"}
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