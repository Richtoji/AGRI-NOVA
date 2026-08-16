import React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
}

export const Table: React.FC<TableProps> = ({ children, className, wrapperClassName, ...props }) => {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-white/10 bg-dark-card/50", wrapperClassName)}>
      <table className={cn("w-full text-left text-xs text-gray-200 border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <thead className={cn("bg-white/[0.03] text-gray-400 font-semibold border-b border-white/10 uppercase text-[10px] tracking-wider", className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <tbody className={cn("divide-y divide-white/5", className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
  <tr className={cn("hover:bg-white/[0.02] transition-colors", className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <th className={cn("px-4 py-3 font-semibold", className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <td className={cn("px-4 py-3 align-middle text-xs", className)} {...props}>
    {children}
  </td>
);
