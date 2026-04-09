import React from 'react';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';

type FindRidesListFooterProps = {
  isFetchingNextPage: boolean;
  primaryColor: string;
};

export function FindRidesListFooter({ isFetchingNextPage, primaryColor }: FindRidesListFooterProps) {
  if (!isFetchingNextPage) {
    return null;
  }

  return (
    <Box className="py-8 items-center">
      <Spinner size="small" color={primaryColor} />
    </Box>
  );
}
