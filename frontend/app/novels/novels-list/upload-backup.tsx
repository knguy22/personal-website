"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DialogClose } from "@radix-ui/react-dialog"
import { ChangeEvent, FormEvent, useState } from "react"

export function UploadBackupDialog() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  }

  async function onSubmit(event: FormEvent) {
    // prevents refreshing the entire page
    event.preventDefault(); 
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Upload Backup</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{`Upload Backup`}</DialogTitle>
          <DialogDescription className="text-left">
            {`Valid backups are csv files with the same format as the csv given by the "Download CSV" option.`}<br/><br/>
            <b>WARNING:</b> {`old data will be overwritten by the backup. Make sure you have saved the current page's data if you need it.`}
          </DialogDescription>
          <form onSubmit={onSubmit} className="py-2 space-y-3">
            <Input
              type="file"
              id="file"
              onChange={handleFileChange}
            />
            <DialogClose className="flex flex-row w-full justify-around">
              <Button type="button" variant="outline" className="bg-secondary hover:bg-secondary/80">
                {`Cancel`}
              </Button>
              <Button type="submit" variant="outline" className="bg-destructive hover:bg-destructive/80">
                {`Submit`}
              </Button>
            </DialogClose>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

