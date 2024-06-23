'use client';

import React, {useState} from 'react';

type SortByDropdownProps = {
  isUp: boolean
}

export function SortByDropdown({isUp}: SortByDropdownProps) {

  const [sortBy, setSortBy] = useState("country");
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(sortBy);
  }

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSortBy(event.target.value);
  }

  function handleClick() {
    setSortBy(sortBy === "country" ? "title" : "country");
  }

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