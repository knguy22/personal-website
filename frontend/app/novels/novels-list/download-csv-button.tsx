import * as React from "react"
import { Button } from "../../../components/ui/button"
import { NovelEntry } from "./novel-types"
import { novel_col_names, to_string_arr } from "./novel-types"

interface DownloadCsvButtonProps {
  tableData: NovelEntry[]
}

export function DownloadCsvButton({ tableData }: DownloadCsvButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const headers: string[] = novel_col_names;
        const stringTableData = tableData.map(row => to_string_arr(row));
        const csv = arrayToCsv([headers, ...stringTableData]);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "novels.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      }
    >
      Download CSV
    </Button>
  )
}

function arrayToCsv(data: string[][]) {
  return data.map(row =>
    row
    .map(String)  // convert every value to String
    .map(v => v.replaceAll('"', '""'))  // escape double quotes
    .map(v => `"${v}"`)  // quote it
    .join(',')  // comma-separated
  ).join('\r\n');  // rows starting on new lines
}