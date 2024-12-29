"use client"

import PageHeader from "@/components/derived/PageHeader";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChangeEvent, FormEvent, useState } from "react"

export default function Page() {
  return (
    <>
      <PageHeader>Image To Tetris</PageHeader>
      <UploadImage/>
    </>
  );
}


function UploadImage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  }

  function intToBlob(i: number) : Blob {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setInt32(0, i, true);
    return new Blob([buffer])
  }

  async function onSubmit(event: FormEvent) {
    // don't refresh the page
    event.preventDefault();
    if (!file) {
      return
    }

    const board_width = 100;
    const board_height = 100;

    // send the image
    const formData = new FormData();
    formData.append('image', file);
    formData.append('board_width', intToBlob(board_width));
    formData.append('board_height', intToBlob(board_height));

    const init = {
      method: "POST",
      body: formData,
    };

    let res = null;
    try {
      res = await fetch("api/image_to_tetris", init);
      if (!res.ok) {
        console.error(`Error from server: ${ await res.text() || "Unknown error"}`);
      }
    } catch (e) {
      console.log(e)
    }
    
    // download the result image if can do
    if (!res || !res.ok) {
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tetris-(${board_width}x${board_height})-${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-1/2 text-center">
        {`Upload an image to approximate it using Tetris blocks!`}<br/>
      </div>
      <form onSubmit={onSubmit} className="py-2 space-y-3">
        <Input
          type="file"
          id="file"
          onChange={handleFileChange}
        />
        <div className="w-full flex justify-between">
          <Button type="reset" variant="outline" size='lg' disabled={!file} className="bg-secondary hover:bg-secondary/80">
            {`Clear`}
          </Button>
          <Button type="submit" variant="outline" size='lg' disabled={!file}  className="bg-destructive hover:bg-destructive/80">
            {`Submit`}
          </Button>
        </div>
      </form>
    </div>
  )
}
