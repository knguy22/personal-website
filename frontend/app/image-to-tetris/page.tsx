"use client"

import PageHeader from "@/components/derived/PageHeader";

import { ChangeEvent, FormEvent, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/hooks/use-toast";
import Loading from "@/components/derived/Loading";

export default function Page() {
  return (
    <div className="pb-5">
      <PageHeader>Image To Tetris</PageHeader>
      <UploadImage/>
    </div>
  );
}

function UploadImage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [options, setOptions] = useState<TetrisOptions>({
    board_height: 100,
    board_width: 100,
    prioritize_tetrominos: true,
  });

  const {toast} = useToast();

  const file_url = file ? URL.createObjectURL(file) : null;
  const result_url = result ? URL.createObjectURL(result) : null;
  const not_sendable = !file || !options.board_width || !options.board_height || uploading;

  const handleFileClear = () => {
    setFile(null);
    setResult(null);
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

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
    setUploading(true);

    // send the image
    const formData = new FormData();
    formData.append('image', file);
    formData.append('board_width', intToBlob(options.board_width));
    formData.append('board_height', intToBlob(options.board_height));
    formData.append('prioritize_tetrominos', intToBlob(+options.prioritize_tetrominos));

    const init = {
      method: "POST",
      body: formData,
    };

    let res = null;
    try {
      res = await fetch("api/image_to_tetris", init);
      if (!res.ok) {
        toast({title: `Error converting image to Tetris`});
      }
    } catch (e) {
      toast({title: `Error converting image to Tetris`});
    }

    // handle the result
    setUploading(false);
    if (!res || !res.ok) {
      return;
    }
    setResult(await res.blob());
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-3/4 sm:w-1/3 text-left px-3">
        {`Upload an image to approximate it using Tetris blocks! Uploaded images are deleted from the server.`}
      </div>
      <form onSubmit={onSubmit} className="flex flex-col py-2 space-y-3 items-center">
        <Input
          type="file"
          id="file"
          onChange={handleFileChange}
          accept="image/*"
          className="w-3/4 sm:w-full"
        />
        <div className="grid grid-cols-3">
          <Button type="reset" variant="secondary" disabled={not_sendable} onClick={handleFileClear}>
            {`Clear`}
          </Button>
          <div></div>
          <Button type="submit" variant="default" disabled={not_sendable}>
            {`Submit`}
          </Button>
        </div>
      </form>
      <TetrisOptionsDashboard options={options} setOptions={setOptions}></TetrisOptionsDashboard>
      <div className="w-4/5 flex flex-row justify-between">
        <div className="w-1/3 flex flex-col items-center transition-colors space-y-2">
          <div className="text-xl">Input Image</div>
          <DynamicImage url={file_url} alt="Input Image"></DynamicImage>
        </div>
        <div className="w-1/3 flex flex-col items-center transition-colors space-y-2">
          <div className="text-xl">Tetris Image</div>
          {uploading ?
            <Loading/> :
            <DynamicImage url={result_url} alt="Tetris Image"></DynamicImage>
          }
          {result_url && !uploading ? 
              (<a href={result_url || undefined} download={true}>
                <Button variant="default" size="lg">
                  Download Image
                </Button>
              </a>)
            : null
          }
        </div>
      </div>
    </div>
  )
}

type TetrisOptions = {
  board_width: number,
  board_height: number,
  prioritize_tetrominos: boolean,
};

interface TetrisOptionsDashboardProps {
  options: TetrisOptions;
  setOptions: (options: TetrisOptions) => void;
}

function TetrisOptionsDashboard( {options, setOptions}: TetrisOptionsDashboardProps) {
  function setOption<K extends keyof TetrisOptions>(option: K, value: TetrisOptions[K]) {
    setOptions({
      ...options,
      [option]: value
    })
  }

  return (
    <div className="w-3/5 sm:w-1/3 py-4 space-y-4">
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <div>{"Board Width (Minos)"}:</div>
          <Input
            value={options.board_width || ""}
            type="number"
            onChange={e => setOption("board_width", +e.target.value)}
            placeholder="Board Width"
            className="h-12 w-full"
          />
        </div>
        <div className="flex flex-col">
          <div>{"Board Height (Minos)"}:</div>
          <Input
            value={options.board_height || ""}
            type="number"
            onChange={e => setOption("board_height", +e.target.value)}
            placeholder="Board Height"
            className="h-12 w-full"
          />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div>{"Prioritize Tetrominos Over Garbage Minos"}:</div>
          <Input
            type="checkbox"
            onChange={e => setOption("prioritize_tetrominos", e.target.checked)}
            placeholder="Prioritize Tetrominos"
            checked={options.prioritize_tetrominos}
          />
        </div>
      </div>
      <div className="pt-1 text-sm">
        {"Note: Board dimensions cannot be set higher than the amount of pixels in the image. \
        If an image is 200x150, you can only set the board width and board height to 200 and 150 respectively."}
      </div>
    </div>
  )
}

interface DynamicImageProps {
  url: string | null;
  alt: string;
}

function DynamicImage( {url, alt}: DynamicImageProps ) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url || !imgRef.current) return;

    const img = imgRef.current;

    const updateDimensions = () => {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    // Ensure the image is already loaded or attach the load event listener
    if (img.complete) {
      updateDimensions();
    } else {
      img.addEventListener('load', updateDimensions);
    }

    // Clean up event listener on component unmount
    return () => {
      img.removeEventListener('load', updateDimensions);
    };
  }, [url]);

  if (!url) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <picture>
        <img ref={imgRef} src={url} alt={alt} />
      </picture>
      {dimensions && (
        <div>{`${dimensions.width}x${dimensions.height} image dimensions`}</div>
      )}
    </div>
  );
}
