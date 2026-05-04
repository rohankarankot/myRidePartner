import React, { forwardRef } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';

export interface AppFlashListProps<T> extends FlashListProps<T> {
  // We make estimatedItemSize required because it's crucial for FlashList performance
  estimatedItemSize: number;
}

/**
 * A standardized wrapper around @shopify/flash-list.
 * 
 * Why use this instead of FlatList?
 * - FlatList renders items slowly and uses excessive memory for large lists.
 * - FlashList recycles views instantly, providing smooth 60fps scrolling.
 * 
 * Note: You MUST provide an `estimatedItemSize` (the approximate height of a single item in pixels).
 */
export const AppFlashList = forwardRef(
  <T extends any>(props: AppFlashListProps<T>, ref: React.Ref<any>) => {
    return (
      <FlashList
        ref={ref}
        {...props}
      />
    );
  }
) as <T>(
  props: AppFlashListProps<T> & { ref?: React.Ref<any> }
) => React.ReactElement;
