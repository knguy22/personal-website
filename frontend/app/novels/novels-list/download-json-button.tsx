import * as React from "react"
import { Button } from "../../../components/ui/button"
import { NovelEntry } from "./novel-types"
import { entry_to_api } from "./novel-types"

interface DownloadJsonButtonProps {
  tableData: NovelEntry[]
}

export function DownloadJsonButton({ tableData }: DownloadJsonButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        // export to api since it can be used in the backend
        const novelTableData = tableData.map(entry_to_api);

        const now = new Date();
        const blob = new Blob([JSON.stringify(novelTableData)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `novels_${now.toISOString()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      }
    >
      Download JSON
    </Button>
  )
}
