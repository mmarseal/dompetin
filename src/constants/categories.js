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

/**
 * src/constants/categories.js
 *
 * Single source of truth for all transaction categories.
 * Used by AddTransaction (category picker) and Home (transaction icon/color lookup).
 *
 * Shape:
 *  id          – internal key
 *  label       – stored in the transaction object
 *  icon        – Lucide React component
 *  color       – Tailwind classes for the icon bubble (inactive)
 *  activeColor – Tailwind bg class for the selected state in the picker
 */
export const CATEGORIES = [
  {
    id: 'food',
    label: 'Food',
    icon: Utensils,
    color: 'bg-orange-100 text-orange-500',
    activeColor: 'bg-orange-500',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Car,
    color: 'bg-blue-100 text-blue-500',
    activeColor: 'bg-blue-500',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingBag,
    color: 'bg-pink-100 text-pink-500',
    activeColor: 'bg-pink-500',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Music,
    color: 'bg-purple-100 text-purple-500',
    activeColor: 'bg-purple-500',
  },
  {
    id: 'bills',
    label: 'Bills',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
    activeColor: 'bg-yellow-500',
  },
  {
    id: 'health',
    label: 'Health',
    icon: Heart,
    color: 'bg-red-100 text-red-500',
    activeColor: 'bg-red-500',
  },
  {
    id: 'salary',
    label: 'Salary',
    icon: Briefcase,
    color: 'bg-emerald-100 text-emerald-600',
    activeColor: 'bg-emerald-500',
  },
  {
    id: 'others',
    label: 'Others',
    icon: MoreHorizontal,
    color: 'bg-gray-100 text-gray-500',
    activeColor: 'bg-gray-500',
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
