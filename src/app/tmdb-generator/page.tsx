'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import { useSidebarStore, useUserStore, useSettingsStore } from '@/lib/store';
import { ArrowLeft, Sparkles, Plus, Check, Loader2, RefreshCw, Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';

const movieGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const tvGenres = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
];

const years = Array.from({ length: 57 }, (_, i) => 2026 - i);
const countOptions = [20, 50, 100, 200, 300, 400, 500, 750, 1000];
const ITEMS_PER_PAGE = 20;

interface TMDBResult {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  media_type?: string;
}

export default function TMDBGeneratorPage() {
  const { isOpen } = useSidebarStore();
  const { isAdmin } = useUserStore();
  const { primaryColor } = useSettingsStore();
  const router = useRouter();

  const [type, setType] = useState<string>('all');
  const [year, setYear] = useState<string>('all');
  const [genre, setGenre] = useState<string>('all');
  const [count, setCount] = useState<number>(50);
  const [customCount, setCustomCount] = useState<string>('50');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [selectAll, setSelectAll] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [existingTmdbIds, setExistingTmdbIds] = useState<Set<number>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Get genres based on type
  const currentGenres = type === 'tv' ? tvGenres : movieGenres;

  // Calculate pagination
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch existing TMDB IDs on mount
  useEffect(() => {
    async function fetchExistingIds() {
      try {
        const res = await fetch('/api/movies?limit=10000');
        if (res.ok) {
          const data = await res.json();
          const ids = new Set<number>(data.movies.map((m: { tmdbId: number | null }) => m.tmdbId).filter(Boolean));
          setExistingTmdbIds(ids);
        }
      } catch (error) {
        console.error('Failed to fetch existing IDs:', error);
      }
    }
    
    if (mounted && isAdmin) {
      fetchExistingIds();
    }
  }, [mounted, isAdmin]);

  // Redirect if not admin
  useEffect(() => {
    if (mounted && !isAdmin) {
      router.push('/settings');
    }
  }, [mounted, isAdmin, router]);

  const handleDiscover = async () => {
    setLoading(true);
    setResults([]);
    setSelectedIds([]);
    setSelectAll(false);
    setCurrentPage(1);
    
    try {
      const actualCount = customCount ? parseInt(customCount) : count;
      const allResults: TMDBResult[] = [];
      const typesToFetch = type === 'all' ? ['movie', 'tv'] : [type];
      
      const fetchPromises = typesToFetch.map(async (t) => {
        const params = new URLSearchParams({ 
          type: t, 
          count: String(actualCount),
        });
        if (year && year !== 'all') params.append('year', year);
        if (genre && genre !== 'all') params.append('genre', genre);
        
        const res = await fetch(`/api/tmdb/discover?${params.toString()}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data.results) {
            return data.results.map((r: TMDBResult) => ({
              ...r,
              media_type: t
            }));
          }
        }
        return [];
      });

      const fetchResults = await Promise.all(fetchPromises);
      
      for (const typedResults of fetchResults) {
        allResults.push(...typedResults);
      }
      
      // Sort and deduplicate
      const sortedResults = allResults
        .sort((a, b) => b.vote_average - a.vote_average)
        .filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        )
        .slice(0, actualCount);
      
      setResults(sortedResults);
      setTotalResults(sortedResults.length);
      
      if (sortedResults.length === 0) {
        toast({ title: 'No Results', description: 'No results found.' });
      } else {
        toast({ title: 'Success', description: `${sortedResults.length} posts loaded.` });
      }
    } catch (error) {
      console.error('Discover error:', error);
      toast({ title: 'Error', description: 'Failed to fetch.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setResults([]);
    setSelectedIds([]);
    setSelectAll(false);
    setCurrentPage(1);
    
    try {
      const actualCount = customCount ? parseInt(customCount) : count;
      const typesToFetch = type === 'all' ? ['movie', 'tv'] : [type];
      
      const fetchPromises = typesToFetch.map(async (t) => {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}&type=${t}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results) {
            return data.results.map((r: TMDBResult) => ({ ...r, media_type: t }));
          }
        }
        return [];
      });

      const searchResults = await Promise.all(fetchPromises);
      const allResults = searchResults.flat()
        .sort((a, b) => b.vote_average - a.vote_average)
        .filter((item, index, self) => index === self.findIndex(t => t.id === item.id))
        .slice(0, actualCount);
      
      setResults(allResults);
      setTotalResults(allResults.length);
      
      if (allResults.length === 0) {
        toast({ title: 'No Results', description: 'No results found.' });
      } else {
        toast({ title: 'Success', description: `${allResults.length} posts found.` });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to search.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSelected = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      setSelectAll(newSelected.length === results.length && results.length > 0);
      return newSelected;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedIds(checked ? results.map(r => r.id) : []);
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) {
      toast({ title: 'No Selection', description: 'Please select items.', variant: 'destructive' });
      return;
    }
    
    setImporting(true);
    setImportProgress({ current: 0, total: selectedIds.length });
    
    try {
      const movieIds = results
        .filter(r => selectedIds.includes(r.id) && (r.media_type === 'movie' || !r.name))
        .map(r => r.id);
      
      const tvIds = results
        .filter(r => selectedIds.includes(r.id) && (r.media_type === 'tv' || r.name))
        .map(r => r.id);
      
      let importedCount = 0;
      let skippedCount = 0;
      
      if (movieIds.length > 0) {
        const res = await fetch('/api/tmdb/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: movieIds, type: 'movie' }),
        });
        if (res.ok) {
          const data = await res.json();
          importedCount += data.imported || 0;
          skippedCount += data.skipped || 0;
          if (data.failed > 0 && data.errors?.length > 0) {
            toast({ title: 'Some Failed', description: `${data.failed} failed: ${data.errors[0]}`, variant: 'destructive' });
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          toast({ title: 'Import Error', description: errData.error || `Server error (${res.status})`, variant: 'destructive' });
        }
      }
      
      if (tvIds.length > 0) {
        setImportProgress({ current: movieIds.length, total: selectedIds.length });
        const res = await fetch('/api/tmdb/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: tvIds, type: 'tv' }),
        });
        if (res.ok) {
          const data = await res.json();
          importedCount += data.imported || 0;
          skippedCount += data.skipped || 0;
          if (data.failed > 0 && data.errors?.length > 0) {
            toast({ title: 'Some Failed', description: `${data.failed} failed: ${data.errors[0]}`, variant: 'destructive' });
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          toast({ title: 'Import Error', description: errData.error || `Server error (${res.status})`, variant: 'destructive' });
        }
      }
      
      if (importedCount > 0) {
        toast({ title: 'Success!', description: `${importedCount} imported!${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}` });
      } else if (skippedCount > 0) {
        toast({ title: 'Already Exists', description: `${skippedCount} items already imported` });
      }
      
      const newIds = new Set(existingTmdbIds);
      selectedIds.forEach(id => newIds.add(id));
      setExistingTmdbIds(newIds);
      
      setSelectedIds([]);
      setSelectAll(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to import.', variant: 'destructive' });
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} style={{ color: primaryColor }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
            <h1 className="text-xl font-bold">TMDB Generator</h1>
          </div>
        </div>

        <div className="px-4">
          {/* Settings */}
          <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">ဆက်တင်များ</h3>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-[#2D2D2D] border-none h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="movie">Movies</SelectItem>
                    <SelectItem value="tv">Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="bg-[#2D2D2D] border-none h-9 text-sm">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-[#2D2D2D] border-none h-9 text-sm">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {currentGenres.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Count</Label>
                <div className="flex gap-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={customCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty string or valid numbers only
                      if (val === '' || /^\d+$/.test(val)) {
                        setCustomCount(val);
                        if (val && !isNaN(parseInt(val))) {
                          setCount(parseInt(val));
                        }
                      }
                    }}
                    onBlur={() => {
                      // On blur, if empty or invalid, reset to default
                      if (!customCount || parseInt(customCount) < 1) {
                        setCustomCount(String(count));
                      }
                    }}
                    placeholder={String(count)}
                    className="bg-[#2D2D2D] border-none h-9 text-sm w-full"
                  />
                </div>
              </div>
            </div>

            {/* Quick count buttons */}
            <div className="flex gap-1 mb-4 flex-wrap">
              {countOptions.map((c) => {
                const isSelected = count === c && (customCount === '' || customCount === String(c));
                return (
                  <Button
                    key={c}
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    className="h-7 text-xs px-2"
                    style={isSelected ? { backgroundColor: primaryColor } : { borderColor: '#2D2D2D' }}
                    onClick={() => { setCount(c); setCustomCount(String(c)); }}
                  >
                    {c}
                  </Button>
                );
              })}
            </div>

            {/* Search and Buttons */}
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ဇတ်ကားနာမည်ဖြင့်ရှာရန်..."
                className="bg-[#2D2D2D] border-none h-9"
              />
              <Button onClick={handleSearch} disabled={loading} variant="outline" className="h-9 px-3 border-white/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
              <Button onClick={handleDiscover} disabled={loading} className="h-9 px-4" style={{ backgroundColor: primaryColor }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-1" />Discover</>}
              </Button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="bg-[#1E1E1E] rounded-lg p-4">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="selectAll" checked={selectAll} onCheckedChange={handleSelectAll} className="border-white/30" />
                    <Label htmlFor="selectAll" className="text-sm cursor-pointer">All ({results.length})</Label>
                  </div>
                  {selectedIds.length > 0 && (
                    <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
                  )}
                </div>
                
                <Button size="sm" className="h-8" style={{ backgroundColor: primaryColor }} onClick={handleImport} disabled={importing || selectedIds.length === 0}>
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      {importProgress.total > 0 && `${importProgress.current}/${importProgress.total}`}
                    </>
                  ) : (
                    <><Plus className="w-4 h-4 mr-1" />Import{selectedIds.length > 0 && ` (${selectedIds.length})`}</>
                  )}
                </Button>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                {paginatedResults.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isImported = existingTmdbIds.has(item.id);
                  
                  return (
                    <div
                      key={`${item.media_type}-${item.id}`}
                      className={`relative cursor-pointer ${isImported ? 'opacity-60' : ''}`}
                      onClick={() => !isImported && toggleSelect(item.id)}
                    >
                      <div className="aspect-[2/3] relative rounded overflow-hidden">
                        <Image
                          src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '/placeholder-poster.png'}
                          alt={item.title || item.name || ''}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {isImported && (
                          <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {!isImported && (
                          <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-black/50' : 'bg-transparent'}`}>
                            {isSelected && (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-1 line-clamp-2">{item.title || item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</p>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {getPageNumbers().map((page, i) => (
                    <Button
                      key={i}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      style={page === currentPage ? { backgroundColor: primaryColor } : {}}
                      onClick={() => typeof page === 'number' && goToPage(page)}
                      disabled={typeof page === 'string'}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: primaryColor }} />
              <p className="text-gray-400">Loading posts...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Search သို့မဟုတ် Discover button နှိပ်ပါ</p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
