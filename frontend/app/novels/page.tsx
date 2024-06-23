import React from 'react'
import {SortByDropdown, NovelsTable} from './client-components.tsx';
import "./local.css"

export default async function novels() {
  return (
    <>
      <NovelsTable/>
    </>
  );
};
