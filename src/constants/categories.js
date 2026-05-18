import {
  Utensils,
  Car,
  ShoppingBag,
  Music,
  Zap,
  Heart,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react';

export const CATEGORIES = [
  {
    id: 'food',
    label: 'Food',
    icon: Utensils,
    color: 'bg-orange-500/20 text-orange-400',
    activeColor: 'bg-orange-500',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Car,
    color: 'bg-blue-500/20 text-blue-400',
    activeColor: 'bg-blue-500',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingBag,
    color: 'bg-pink-500/20 text-pink-400',
    activeColor: 'bg-pink-500',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Music,
    color: 'bg-purple-500/20 text-purple-400',
    activeColor: 'bg-purple-500',
  },
  {
    id: 'bills',
    label: 'Bills',
    icon: Zap,
    color: 'bg-yellow-500/20 text-yellow-400',
    activeColor: 'bg-yellow-500',
  },
  {
    id: 'health',
    label: 'Health',
    icon: Heart,
    color: 'bg-red-500/20 text-red-400',
    activeColor: 'bg-red-500',
  },
  {
    id: 'salary',
    label: 'Salary',
    icon: Briefcase,
    color: 'bg-emerald-500/20 text-emerald-400',
    activeColor: 'bg-emerald-500',
  },
  {
    id: 'others',
    label: 'Others',
    icon: MoreHorizontal,
    color: 'bg-slate-500/20 text-slate-400',
    activeColor: 'bg-slate-500',
  },
];

/**
 * Look up category metadata by label string.
 * Falls back to "Others" if no match is found.
 *
 * @param {string} label - e.g. "Food", "Transport"
 * @returns {object} - category object from CATEGORIES
 */
export const getCategoryByLabel = (label) =>
  CATEGORIES.find((c) => c.label === label) ?? CATEGORIES[CATEGORIES.length - 1];
