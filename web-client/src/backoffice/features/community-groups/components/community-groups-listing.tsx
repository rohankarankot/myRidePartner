'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Search, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import PageContainer from '@bo/components/layout/page-container';
import { Heading } from '@bo/components/ui/heading';
import { Separator } from '@bo/components/ui/separator';
import { Input } from '@bo/components/ui/input';
import { Button } from '@bo/components/ui/button';
import { Badge } from '@bo/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bo/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@bo/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@bo/components/ui/alert-dialog';
import { adminGet, adminPatch, type PaginatedResult } from '@bo/lib/admin-fetch';
import { useDebouncedCallback } from '@bo/hooks/use-debounced-callback';

type CommunityGroupRow = {
  id: number;
  documentId: string;
  name: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  memberCount: number;
  createdAt: string;
  creator?: {
    id: number;
    username?: string;
    email: string;
    userProfile?: {
      fullName?: string;
      avatar?: string;
    };
  };
};

const STATUS_BADGE: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PENDING: { label: 'Pending', variant: 'outline' },
  APPROVED: { label: 'Approved', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
};

export default function CommunityGroupsListingPage() {
  const [data, setData] = useState<CommunityGroupRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [searchInput, setSearchInput] = useState(q);

  const [actionTarget, setActionTarget] = useState<CommunityGroupRow | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const debouncedSetQ = useDebouncedCallback((value: string) => {
    void setPage(1);
    void setQ(value || null);
  }, 400);

  const load = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setLoading(true);
    try {
      const res = await adminGet<PaginatedResult<CommunityGroupRow>>(
        accessToken,
        '/api/admin/community-groups',
        {
          page,
          limit: perPage,
          search: q || undefined,
        },
      );
      setData(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, perPage, q]);

  useEffect(() => {
    if (status === 'authenticated' && accessToken) {
      void load();
    }
    if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, accessToken, load]);

  const handleAction = async () => {
    if (!accessToken || !actionTarget || !actionType) {
      return;
    }
    setActionLoading(true);
    try {
      await adminPatch(
        accessToken,
        `/api/admin/community-groups/${actionTarget.documentId}/status`,
        { status: actionType },
      );
      void load();
    } catch (e) {
      console.error('Failed to update group status', e);
    } finally {
      setActionLoading(false);
      setActionTarget(null);
      setActionType(null);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <Heading
            title={`Community Groups (${total})`}
            description="Review and approve community groups created by users."
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search name, creator…"
                className="pl-9"
                value={searchInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchInput(v);
                  debouncedSetQ(v);
                }}
              />
            </div>
            {searchInput ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  void setQ(null);
                }}
              >
                Clear search
              </Button>
            ) : null}
          </div>
        </div>
        <Separator />

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No community groups found.
          </p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead className="text-center">Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((group) => {
                    const badge = STATUS_BADGE[group.status] ?? STATUS_BADGE.PENDING;
                    const creatorName =
                      group.creator?.userProfile?.fullName ||
                      group.creator?.username ||
                      group.creator?.email ||
                      '—';

                    return (
                      <TableRow key={group.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{group.name}</p>
                            {group.description && (
                              <p className="text-muted-foreground text-xs line-clamp-1 max-w-xs">
                                {group.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{creatorName}</TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="text-sm">{group.memberCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {group.status !== 'APPROVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  setActionTarget(group);
                                  setActionType('APPROVED');
                                }}
                              >
                                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                Approve
                              </Button>
                            )}
                            {group.status !== 'REJECTED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setActionTarget(group);
                                  setActionType('REJECTED');
                                }}
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                Reject
                              </Button>
                            )}
                            {group.status === 'PENDING' && (
                              <Badge variant="outline" className="ml-1">
                                <Clock className="mr-1 h-3 w-3" />
                                Awaiting
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-4">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => void setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => void setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Approve / Reject Confirmation Dialog */}
      <AlertDialog
        open={!!actionTarget && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setActionTarget(null);
            setActionType(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'APPROVED' ? 'Approve' : 'Reject'} group?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'APPROVED'
                ? `"${actionTarget?.name}" will become visible to all community members.`
                : `"${actionTarget?.name}" will be rejected and remain hidden.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(e) => {
                e.preventDefault();
                void handleAction();
              }}
              className={
                actionType === 'REJECTED'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {actionLoading
                ? 'Saving…'
                : actionType === 'APPROVED'
                  ? 'Approve'
                  : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
