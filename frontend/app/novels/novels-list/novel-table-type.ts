import { NovelEntry } from "./novel-types";

export type NovelTable = {
  options: {
    meta: {
      updateCell: (rowIndex: number, columnId: string, value: string | Date) => void
      updateTableData: (data: NovelEntry[]) => void
    };
  };
  getPreFilteredRowModel: () => {
    flatRows: {
      original: NovelEntry;
    }[];
  };
}
