export type ActivityFilterTab = 'published' | 'in-progress' | 'completed' | 'part-of' | 'leading';

export const ACTIVITY_FILTER_TABS: { id: ActivityFilterTab; label: string }[] = [
  { id: 'published', label: 'Published' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'part-of', label: 'Part Of' },
];
