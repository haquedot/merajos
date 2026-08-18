'use client';

import React, { useState, useMemo } from 'react';
import { useLinkStore } from '../../store/useLinkStore';
import { SavedLink } from '../../types';
import {
  Link2,
  Plus,
  Search,
  Star,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  Globe,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Grid,
  List as ListIcon,
  Tag,
  Link,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { LinkModal } from '../../components/modals/LinkModal';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/PageHeader';

export default function LinksPage() {
  const {
    links,
    isLoading,
    searchQuery,
    selectedCategory,
    onlyFavorites,
    currentPage,
    itemsPerPage,
    addLink,
    updateLink,
    deleteLink,
    toggleFavorite,
    setSearchQuery,
    setSelectedCategory,
    setOnlyFavorites,
    setCurrentPage,
    setItemsPerPage,
    resetFilters,
  } = useLinkStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<SavedLink | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract unique categories from links
  const categories = useMemo(() => {
    const set = new Set<string>();
    links.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return ['All', ...Array.from(set)];
  }, [links]);

  // Filter links based on search query, category & favorites toggle
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.description && link.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (link.tags && link.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        selectedCategory === 'All' || link.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesFavorite = !onlyFavorites || link.isFavorite;

      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [links, searchQuery, selectedCategory, onlyFavorites]);

  // Pagination calculation
  const totalItems = filteredLinks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLinks = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredLinks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLinks, validCurrentPage, itemsPerPage]);

  // Stats calculation
  const totalFavorites = useMemo(() => links.filter((l) => l.isFavorite).length, [links]);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link: SavedLink) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (link: SavedLink) => {
    setDeletingLink(link);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingLink) {
      const linkTitle = deletingLink.title;
      await deleteLink(deletingLink.id);
      toast.success(`Deleted "${linkTitle}"`);
      setDeletingLink(null);
      setDeleteModalOpen(false);
    }
  };

  const handleToggleFav = async (link: SavedLink) => {
    await toggleFavorite(link.id);
    if (!link.isFavorite) {
      toast.success(`Starred "${link.title}"`);
    } else {
      toast(`Unstarred "${link.title}"`, { icon: '⭐' });
    }
  };

  const getDomain = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return parsed.hostname.replace('www.', '');
    } catch (e) {
      return 'link';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <PageHeader
        icon={Link}
        iconBgColor="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        title="Saved Links & Resources"
        badgeText={`${links.length} Links`}
        badgeVariant="blue"
        subtitle="Store, categorize, search, and manage your important web links, tools, and documentation."
        actions={
          <>

            <button
              onClick={handleOpenAddModal}
              className="btn-primary px-3 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Link</span>
            </button>
          </>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Total Links</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{links.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Starred Favorites</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{totalFavorites}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Categories</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{categories.length - 1 || 1}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Filtered Match</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{filteredLinks.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Search, Category Pills, Favorite Toggle & View Switcher */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search links by title, URL, tag, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end">
            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${onlyFavorites
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
              Favorites Only
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                title="Compact List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-gray-400 font-medium flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all ${selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {cat}
            </button>
          ))}
          {(searchQuery || selectedCategory !== 'All' || onlyFavorites) && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-extrabold whitespace-nowrap ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content List / Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 text-sm animate-pulse">
          Loading bookmark links...
        </div>
      ) : paginatedLinks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center">
            <Link2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Saved Links Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All' || onlyFavorites
              ? 'No links match your current search or category filter criteria.'
              : 'Start organizing your web documentation by adding your first bookmark link.'}
          </p>
          <Button
            onClick={handleOpenAddModal}
            className="btn-primary text-white font-bold text-xs px-4 py-2 rounded-xl mt-2"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add First Link
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {paginatedLinks.map((link) => {
              const domain = getDomain(link.url);
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

              return (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Favicon + Domain Badge + Favorite Star */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={faviconUrl}
                          alt={domain}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                          className="w-6 h-6 rounded-md object-contain shrink-0 bg-gray-100 dark:bg-gray-800 p-0.5"
                        />
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] font-bold text-gray-600 dark:text-gray-300 truncate">
                          {domain}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleFav(link)}
                        className={`p-1.5 rounded-lg transition-colors ${link.isFavorite
                            ? 'text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'text-gray-300 hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        title={link.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                      >
                        <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.title}
                        </a>
                      </h3>
                      {link.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {link.description}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    {link.tags && link.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {link.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <Tag className="w-2.5 h-2.5" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                      {link.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Copy URL */}
                      <button
                        onClick={() => handleCopy(link.url, link.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Copy Link URL"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditModal(link)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Edit Link"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleOpenDeleteModal(link)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Open Link */}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors ml-1"
                        title="Open link in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-xs">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedLinks.map((link) => {
              const domain = getDomain(link.url);
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

              return (
                <div
                  key={link.id}
                  className="p-3.5 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleFav(link)}
                      className={`p-1 rounded-lg shrink-0 ${link.isFavorite ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'
                        }`}
                    >
                      <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    <img
                      src={faviconUrl}
                      alt={domain}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-5 h-5 rounded object-contain shrink-0 bg-gray-100 dark:bg-gray-800 p-0.5"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                        >
                          {link.title}
                        </a>
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 shrink-0 hidden sm:inline-block">
                          {link.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 truncate block">
                        {link.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(link.url, link.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(link)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      title="Edit Link"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(link)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {filteredLinks.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          {/* Pagination Counter Info */}
          <div className="text-gray-500 dark:text-gray-400 font-medium">
            Showing{' '}
            <strong className="text-gray-900 dark:text-white font-extrabold">
              {Math.min((validCurrentPage - 1) * itemsPerPage + 1, totalItems)}
            </strong>{' '}
            to{' '}
            <strong className="text-gray-900 dark:text-white font-extrabold">
              {Math.min(validCurrentPage * itemsPerPage, totalItems)}
            </strong>{' '}
            of <strong className="text-gray-900 dark:text-white font-extrabold">{totalItems}</strong> saved links
          </div>

          <div className="flex items-center gap-3">
            {/* Items Per Page Select */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage(validCurrentPage - 1)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 rounded-lg font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {validCurrentPage} / {totalPages}
              </span>

              <button
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage(validCurrentPage + 1)}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <LinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          if (editingLink) {
            await updateLink(editingLink.id, data);
          } else {
            await addLink(data);
          }
        }}
        initialData={editingLink}
        categories={categories}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={deletingLink?.title}
      />
    </div>
  );
}
