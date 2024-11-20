import { Row } from "@tanstack/react-table";
import { NovelEntry } from "./novel-types";

export type NovelRow = Row<NovelEntry>;
export type NovelTable = {
  options: {
    meta: {
      updateCell: (rowIndex: number, columnId: string, value: string | Date) => void
      updateTableData: (data: NovelEntry[]) => void
    };
  };
  getPreFilteredRowModel: () => {
    flatRows: NovelRow[];
  };
}
