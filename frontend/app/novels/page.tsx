import React from 'react'
import {SortByDropdown} from './client-components.tsx';
import { NovelsTable } from './server-components.tsx';
import "./local.css"

export default async function novels() {
  return (
    <>
      <SortByDropdown {...{isUp: true}}/>
      <NovelsTable/>
    </>
  );
};
