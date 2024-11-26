"use client"

import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type BackupForm = {
  file: FileList;
};

function UploadBackupForm() {
  const form = useForm<BackupForm>();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Backup File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  id="file"
                  onChange={(e) => field.onChange(e.target.files)}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

async function onSubmit() {

}