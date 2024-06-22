import Image from "next/image";
import React from 'react'
import "./local.css"

export default async function novels() {
  const novels = await fetch_novels();

  return (
    <div>
      {JSON.stringify(novels, undefined, 4)}
    </div>
  )
}

async function fetch_novels() {
  const response = await fetch('http://localhost:3000/novels');
  if (!response.ok) {
    throw new Error('Failed to fetch novels');
  }

  let novels = await response.json();
  return novels;
}