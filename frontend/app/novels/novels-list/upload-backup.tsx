"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ChangeEvent, FormEvent, useState } from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/hooks/use-toast"

import { fetch_backend } from "@/lib/fetch_backend"

export function UploadBackupDialog() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  }

  async function onSubmit(event: FormEvent) {
    // prevent the form from refreshing components
    event.preventDefault(); 

    if (!file) {
      return
    }

    const formData = new FormData();
    formData.append('uploadedFile', file);

    const res = await fetch_backend(
      {path: "/api/upload_novels_backup", method: "POST", body: formData}
    );

    // check whether the backend successfully updated the data
    // if so, refresh the entire page
    if (!res.error) {
      window.location.reload();
    } else {
      toast({title: "Error uploading backup"})
    }
  }

  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline" }))}>
        Upload Backup
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{`Upload Backup`}</DialogTitle>
          <DialogDescription className="text-left">
            {`Valid backups are JSON files with the same format as the JSON given by the "Download JSON" option.`}<br/><br/>
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

