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
  const [result, setResult] = useState<Blob | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
    setResult(null);
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

    setResult(await res.blob());
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-1/2 text-center">
        {`Upload an image to approximate it using Tetris blocks!`}<br/>
        {`Uploaded images are deleted from the server.`}<br/>
      </div>
      <form onSubmit={onSubmit} className="py-2 space-y-3">
        <Input
          type="file"
          id="file"
          onChange={handleFileChange}
        />
        <div className="w-full flex justify-between">
          <Button type="reset" variant="secondary" size='lg' disabled={!file}>
            {`Clear`}
          </Button>
          <Button type="submit" variant="default" size='lg' disabled={!file}>
            {`Submit`}
          </Button>
        </div>
      </form>
      <div className="w-4/5 flex flex-row justify-between">
        <DynamicImage title={"Input Image"} blob={file} alt={"input image"}></DynamicImage>
        <DynamicImage title={"Tetris Version"} blob={result} alt={"output image"}></DynamicImage>
      </div>
    </div>
  )
}

interface DynamicImageProps {
  title: string;
  blob: Blob | null;
  alt: string;
}

function DynamicImage( {title, blob, alt}: DynamicImageProps ) {
  let content = null;
  if (blob) {
    const url = URL.createObjectURL(blob);
    content = (
      <div className="flex flex-col items-center space-y-2">
        <picture>
          <img src={url} alt={alt}></img>
        </picture>
        <a href={url} download>
          <Button variant="default" size="lg">
            Download Image
          </Button>
        </a>
      </div>
    )
  }

  return (
    <div className="w-1/3 flex flex-col items-center transition-colors space-y-2">
      <div className="text-xl">{title}</div>
      {content}
    </div>
  )
}