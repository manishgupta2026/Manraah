"use client";

import React, { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  emptyIcon?: string;
  loading?: boolean;
}

export default function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  emptyIcon = "inbox",
  loading = false,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-bold text-on-surface-variant animate-pulse">
        Loading operational records...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low/50 text-center space-y-2 select-none">
        <span className="material-symbols-outlined text-3xl text-primary opacity-50">{emptyIcon}</span>
        <p className="text-xs font-bold text-on-surface">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto select-none">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-surface-variant/20 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className={`pb-3 px-3.5 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-variant/10">
          {data.map((row, rowIdx) => (
            <tr key={keyExtractor(row, rowIdx)} className="hover:bg-surface-container-low/50 transition-all">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`py-3.5 px-3.5 ${col.className || ""}`}>
                  {typeof col.accessor === "function"
                    ? col.accessor(row)
                    : col.accessor
                    ? (row[col.accessor] as unknown as ReactNode)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
