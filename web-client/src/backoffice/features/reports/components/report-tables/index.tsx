'use client';

import { DataTable } from '@bo/components/ui/table/data-table';
import { DataTableToolbar } from '@bo/components/ui/table/data-table-toolbar';
import { useDataTable } from '@bo/hooks/use-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { UserReportRow, columns } from './columns';

interface ReportTableProps {
  data: UserReportRow[];
  totalItems: number;
}

export function ReportTable({ data, totalItems }: ReportTableProps) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  const { table } = useDataTable({
    data,
    columns: columns as ColumnDef<UserReportRow, any>[],
    pageCount,
    shallow: false,
    debounceMs: 500,
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
