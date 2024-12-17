import { CellContext } from "@tanstack/react-table";
import { NovelEntry } from './novel-types';

export const DateCell = ({ getValue } : CellContext<NovelEntry, string>) => {
  const date = new Date(getValue());
  
  return (
    <div className="px-4">
      {date.toDateString()}
      <br />
      {date.toLocaleTimeString()}
    </div>
  )
}
