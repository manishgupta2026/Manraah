"use client";

import React, { ReactNode } from "react";
import { TableSkeletonRows } from "./AdminSkeleton";

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string;
  emptyMessage?: string;
  emptySubtitle?: string;
  emptyIcon?: string;
  emptyAction?: ReactNode;
  loading?: boolean;
  skeletonRows?: number;
}

export default function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  emptySubtitle = "There are no operational records matching your active filters.",
  emptyIcon = "inbox",
  emptyAction,
  loading = false,
  skeletonRows = 5,
}: AdminTableProps<T>) {
  const getKey = keyExtractor || ((row: any, idx: number) => row?.id || String(idx));

  if (loading) {
    return <TableSkeletonRows rows={skeletonRows} cols={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 px-6 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 text-center space-y-3 select-none">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <span className="material-symbols-outlined text-2xl">{emptyIcon}</span>
        </div>
        <div className="max-w-sm mx-auto space-y-1">
          <p className="text-sm font-semibold text-slate-800">{emptyMessage}</p>
          <p className="text-xs text-slate-500">{emptySubtitle}</p>
        </div>
        {emptyAction && <div className="pt-2">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white select-none">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 font-semibold ${col.headerClassName || col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIdx) => (
            <tr
              key={getKey(row, rowIdx)}
              className="hover:bg-slate-50/70 transition-colors duration-150"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`py-3.5 px-4 text-slate-700 align-middle ${col.className || ""}`}
                >
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
