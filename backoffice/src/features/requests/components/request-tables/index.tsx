'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { JoinRequest, columns } from './columns';

interface RequestTableProps {
  data: JoinRequest[];
  totalItems: number;
}

export function RequestTable({ data, totalItems }: RequestTableProps) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns: columns as ColumnDef<JoinRequest, any>[],
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
