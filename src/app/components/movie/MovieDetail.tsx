'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Star,
  Calendar,
  Clock,
  Bookmark,
  BookmarkCheck,
  Play,
  Download,
  ThumbsUp,
  FileText,
  ChevronDown,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Tv,
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { useUserStore, useSettingsStore, StoredMovie } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

interface DownloadLink {
  id: string;
  server: string;
  size: string;
  resolution: string;
  url: string;
  linkText: string;
  episodeId?: string | null;
}

interface VideoServer {
  id: string;
  name: string;
  url: string;
}

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  stillPath: string | null;
  downloadLinks?: DownloadLink[];
  videoServers?: VideoServer[];
}

interface Season {
  id: string;
  seasonNumber: number;
  name: string;
  episodes: Episode[];
}

interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  rating: number;
  runtime: number | null;
  type: 'movie' | 'series';
  genres: string[];
  quality: string | null;
  downloadLinks: DownloadLink[];
  videoServers?: VideoServer[];
  seasons: Season[];
}

interface MovieDetailProps {
  movie: Movie;
  isAdmin: boolean;
}

const serverOptions = [
  'Megaup', 'Mega', 'Yoteshin', 'Gdtot', 'MediaFire',
  'Google Drive', 'Direct download', 'Usersdrive', 'Other'
];

const resolutionOptions = ['4K', '2K', '1080p', '720p', '480p', '360p'];

const genreOptions = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

export default function MovieDetail({ movie, isAdmin }: MovieDetailProps) {
  const router = useRouter();
  const {
    isBookmarked,
    addBookmark,
    removeBookmark,
    downloadEnabled,
    addViewedMovie,
    isMovieViewed,
  } = useUserStore();
  const { primaryColor } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedSeason, setSelectedSeason] = useState<number>(0);
  const [showAddDownload, setShowAddDownload] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);

  useEffect(() => {
    const allLinks: DownloadLink[] = [...(movie.downloadLinks || [])];

    if (movie.type === 'series' && movie.seasons) {
      movie.seasons.forEach(season => {
        season.episodes.forEach(episode => {
          if (episode.downloadLinks) {
            episode.downloadLinks.forEach(link => {
              allLinks.push({
                ...link,
                episodeId: episode.id
              });
            });
          }
        });
      });
    }

    setDownloadLinks(allLinks);
  }, [movie]);

  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [editForm, setEditForm] = useState({
    title: movie.title,
    overview: movie.overview,
    quality: movie.quality || 'none',
    runtime: movie.runtime?.toString() || '',
    genres: movie.genres,
  });

  const [newLink, setNewLink] = useState({
    server: '',
    size: '',
    resolution: '',
    url: '',
    linkText: 'Download',
  });

  const storedMovie: StoredMovie = useMemo(() => ({
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    backdropPath: movie.backdropPath,
    releaseDate: movie.releaseDate,
    rating: movie.rating,
    type: movie.type,
    quality: movie.quality,
  }), [movie]);

  const bookmarked = isBookmarked(movie.id);
  const viewed = isMovieViewed(movie.id);

  const validSeasons = useMemo(() =>
    movie.seasons.filter(s => s.seasonNumber > 0).sort((a, b) => a.seasonNumber - b.seasonNumber),
    [movie.seasons]
  );

  useEffect(() => {
    if (movie.type === 'series' && validSeasons.length > 0) {
      setSelectedSeason(validSeasons[0].seasonNumber);
    }
  }, [movie.type, validSeasons]);

  useEffect(() => {
    if (!viewed) {
      addViewedMovie(storedMovie);
    }
  }, [storedMovie.id, viewed, addViewedMovie]);

  useEffect(() => {
    if (activeTab === 'explore' && movie.genres.length > 0) {
      fetchRelatedMovies();
    }
  }, [activeTab, movie.genres]);

  const fetchRelatedMovies = async () => {
    setLoadingRelated(true);
    try {
      const res = await fetch(`/api/movies?limit=20&type=${movie.type}`);
      if (res.ok) {
        const data = await res.json();
        const related = (data.movies || [])
          .filter((m: Movie) => m.id !== movie.id)
          .filter((m: Movie) => {
            try {
              const mGenres = JSON.parse(m.genres as unknown as string || '[]');
              return mGenres.some((g: string) => movie.genres.includes(g));
            } catch {
              return false;
            }
          })
          .slice(0, 10);
        setRelatedMovies(related);
      }
    } catch (error) {
      console.error('Failed to fetch related movies:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(movie.id);
      toast({ title: 'Bookmark ဖယ်ရှားပြီး' });
    } else {
      addBookmark(storedMovie);
      toast({ title: 'Bookmark သိမ်းဆည်းပြီး' });
    }
  };

  const currentSeason = useMemo(() =>
    validSeasons.find(s => s.seasonNumber === selectedSeason),
    [validSeasons, selectedSeason]
  );

  const getEpisodeDownloadLinks = (episodeId: string) => {
    return downloadLinks.filter(l => l.episodeId === episodeId);
  };

  const getMovieDownloadLinks = () => {
    return downloadLinks.filter(l => !l.episodeId);
  };

  const handleAddDownloadLink = async () => {
    if (!newLink.server || !newLink.size || !newLink.resolution || !newLink.url) {
      toast({ title: 'Missing Fields', variant: 'destructive' });
      return;
    }

    const link: DownloadLink = {
      id: `dl-${Date.now()}`,
      server: newLink.server,
      size: newLink.size,
      resolution: newLink.resolution,
      url: newLink.url,
      linkText: newLink.linkText || 'Download',
      episodeId: movie.type === 'series' ? selectedEpisodeId : null,
    };

    try {
      const res = await fetch('/api/download-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: link.server,
          size: link.size,
          resolution: link.resolution,
          url: link.url,
          linkText: link.linkText,
          movieId: movie.type === 'movie' ? movie.id : null,
          episodeId: link.episodeId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.downloadLink) link.id = data.downloadLink.id;
      }
    } catch (error) {
      console.error('Save error:', error);
    }

    setDownloadLinks(prev => [...prev, link]);
    setNewLink({ server: '', size: '', resolution: '', url: '', linkText: 'Download' });
    setShowAddDownload(false);
    setSelectedEpisodeId(null);
    toast({ title: 'Download Link ထည့်ပြီး' });
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await fetch('/api/download-links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: linkId }),
      });
    } catch (error) {
      console.error('Delete error:', error);
    }
    setDownloadLinks(prev => prev.filter(l => l.id !== linkId));
    toast({ title: 'Link ဖျက်ပြီး' });
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/movies/${movie.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast({ title: 'သိမ်းဆည်းပြီး' });
        setShowEditDialog(false);
        router.refresh();
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };



  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/movies/${movie.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Deleted', description: 'Post deleted permanently.' });
        router.push(movie.type === 'series' ? '/series' : '/movies');
      } else {
        toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const toggleGenre = (genre: string) => {
    setEditForm(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : '/placeholder-poster.png';

  const backdropUrl = movie.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
    : posterUrl;

  const year = movie.releaseDate?.split('-')[0] || '';
  const runtime = movie.runtime ? `${movie.runtime} min` : '';

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[50vh]">
        <Image
          src={backdropUrl}
          alt={movie.title || 'Movie'}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="ghost" size="icon" className="bg-black/50 rounded-full" onClick={() => router.back()}>
            <ChevronDown className="w-5 h-5 rotate-90" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/50 rounded-full" onClick={handleBookmark}>
            {bookmarked ? (
              <BookmarkCheck className="w-5 h-5" style={{ color: primaryColor }} />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="px-4 -mt-20 relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{movie.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-4">
          {year && <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{year}</span></div>}
          <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span>{movie.rating.toFixed(1)}</span></div>
          {runtime && <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{runtime}</span></div>}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genres.map((genre) => (
            <Badge key={genre} variant="secondary" className="bg-[#2D2D2D]">{genre}</Badge>
          ))}
        </div>

        {movie.quality && (
          <Badge className="mb-4" style={{ backgroundColor: primaryColor }}>{movie.quality}</Badge>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          <Button variant="ghost" className={cn('flex flex-col items-center gap-1 min-w-[70px]', activeTab === 'detail' && 'text-white')} style={activeTab === 'detail' ? { color: primaryColor } : {}} onClick={() => setActiveTab('detail')}>
            <FileText className="w-5 h-5" /><span className="text-xs">Detail</span>
          </Button>
          <Button variant="ghost" className={cn('flex flex-col items-center gap-1 min-w-[70px]', activeTab === 'watch' && 'text-white')} style={activeTab === 'watch' ? { color: primaryColor } : {}} onClick={() => setActiveTab('watch')}>
            <Tv className="w-5 h-5" /><span className="text-xs">Watch</span>
          </Button>
          <Button variant="ghost" className={cn('flex flex-col items-center gap-1 min-w-[70px]', activeTab === 'download' && 'text-white')} style={activeTab === 'download' ? { color: primaryColor } : {}} onClick={() => setActiveTab('download')}>
            <Download className="w-5 h-5" /><span className="text-xs">Download</span>
          </Button>
          <Button variant="ghost" className={cn('flex flex-col items-center gap-1 min-w-[70px]', activeTab === 'explore' && 'text-white')} style={activeTab === 'explore' ? { color: primaryColor } : {}} onClick={() => setActiveTab('explore')}>
            <ThumbsUp className="w-5 h-5" /><span className="text-xs">Explore</span>
          </Button>
          {isAdmin && (
            <>
              <Button variant="ghost" className="flex flex-col items-center gap-1 min-w-[70px] text-gray-400" onClick={() => setShowEditDialog(true)}>
                <Edit className="w-5 h-5" /><span className="text-xs">Edit</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center gap-1 min-w-[70px] text-red-400" onClick={handleDeletePost}>
                <Trash2 className="w-5 h-5" /><span className="text-xs">Delete</span>
              </Button>
            </>
          )}
        </div>

        {/* Content */}
        {activeTab === 'detail' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 leading-relaxed">{movie.overview || 'No description available.'}</p>
            </div>

            {movie.type === 'movie' && (
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h4 className="font-semibold mb-2">Technical Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Quality:</span><span className="ml-2">{movie.quality || 'N/A'}</span></div>
                  <div><span className="text-gray-400">Runtime:</span><span className="ml-2">{runtime || 'N/A'}</span></div>
                </div>
              </div>
            )}

            {movie.type === 'series' && validSeasons.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Seasons</h3>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                  {validSeasons.map((season) => (
                    <Button key={season.id} variant={selectedSeason === season.seasonNumber ? 'default' : 'outline'} size="sm"
                      style={selectedSeason === season.seasonNumber ? { backgroundColor: primaryColor } : { borderColor: primaryColor, color: primaryColor }}
                      onClick={() => setSelectedSeason(season.seasonNumber)}>
                      {season.name || `Season ${season.seasonNumber}`}
                    </Button>
                  ))}
                </div>

                {currentSeason?.episodes.map((episode) => (
                  <div key={episode.id} className="flex items-center gap-3 bg-[#1E1E1E] rounded-lg p-3 mb-2">
                    <div className="w-24 h-14 relative rounded overflow-hidden flex-shrink-0">
                      {episode.stillPath ? (
                        <Image src={`https://image.tmdb.org/t/p/w300${episode.stillPath}`} alt={episode.title || `Episode ${episode.episodeNumber}`} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-[#2D2D2D] flex items-center justify-center"><Play className="w-6 h-6" /></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Episode {episode.episodeNumber}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{episode.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'download' && (
          <div>
            {!downloadEnabled && !isAdmin && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm">⚠️ No download links. Enable in Menu → Download settings</p>
              </div>
            )}

            {(downloadEnabled || isAdmin) && (
              <>
                {movie.type === 'movie' && (
                  <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
                    <div className="p-3 border-b border-white/10"><h4 className="font-medium">Download Links</h4></div>
                    {getMovieDownloadLinks().length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#2D2D2D] text-left">
                            <th className="px-3 py-2 text-xs">No</th>
                            <th className="px-3 py-2 text-xs">Server</th>
                            <th className="px-3 py-2 text-xs">Size</th>
                            <th className="px-3 py-2 text-xs">Quality</th>
                            <th className="px-3 py-2 text-xs">Link</th>
                            {isAdmin && <th className="px-2 py-2"></th>}
                          </tr>
                        </thead>
                        <tbody>
                          {getMovieDownloadLinks().map((link, index) => (
                            <tr key={link.id} className="border-t border-white/5">
                              <td className="px-3 py-2 text-xs">{index + 1}</td>
                              <td className="px-3 py-2 text-xs">{link.server}</td>
                              <td className="px-3 py-2 text-xs">{link.size}</td>
                              <td className="px-3 py-2 text-xs">{link.resolution}</td>
                              <td className="px-3 py-2">
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-block px-2 py-1 text-xs rounded" style={{ backgroundColor: primaryColor }}>{link.linkText}</a>
                              </td>
                              {isAdmin && (
                                <td className="px-2 py-2">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => handleDeleteLink(link.id)}><Trash2 className="w-3 h-3" /></Button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No download links</p>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="p-3 border-t border-white/10">
                        <Button className="w-full" style={{ backgroundColor: primaryColor }} onClick={() => setShowAddDownload(true)}>
                          <Plus className="w-4 h-4 mr-2" />Add Download Link
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {movie.type === 'series' && validSeasons.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-400 mb-2 block">Season</Label>
                      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                        {validSeasons.map((season) => (
                          <Button key={season.id} variant={selectedSeason === season.seasonNumber ? 'default' : 'outline'} size="sm"
                            style={selectedSeason === season.seasonNumber ? { backgroundColor: primaryColor } : { borderColor: '#2D2D2D' }}
                            onClick={() => setSelectedSeason(season.seasonNumber)}>
                            {season.name || `Season ${season.seasonNumber}`}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {currentSeason && (
                      <div>
                        <Label className="text-xs text-gray-400 mb-2 block">Episodes</Label>
                        <div className="space-y-3">
                          {currentSeason.episodes.map((episode) => {
                            const epLinks = getEpisodeDownloadLinks(episode.id);
                            return (
                              <div key={episode.id} className="bg-[#1E1E1E] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">Episode {episode.episodeNumber}</span>
                                  {isAdmin && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedEpisodeId(episode.id); setShowAddDownload(true); }}>
                                      <Plus className="w-3 h-3 mr-1" />Add Link
                                    </Button>
                                  )}
                                </div>
                                {epLinks.length > 0 ? (
                                  <table className="w-full">
                                    <thead>
                                      <tr className="text-left border-b border-white/10">
                                        <th className="px-2 py-1 text-[10px] text-gray-400">No</th>
                                        <th className="px-2 py-1 text-[10px] text-gray-400">Server</th>
                                        <th className="px-2 py-1 text-[10px] text-gray-400">Size</th>
                                        <th className="px-2 py-1 text-[10px] text-gray-400">Quality</th>
                                        <th className="px-2 py-1 text-[10px] text-gray-400">Link</th>
                                        {isAdmin && <th className="px-1 py-1"></th>}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {epLinks.map((link, index) => (
                                        <tr key={link.id} className="border-t border-white/5">
                                          <td className="px-2 py-1 text-xs">{index + 1}</td>
                                          <td className="px-2 py-1 text-xs">{link.server}</td>
                                          <td className="px-2 py-1 text-xs">{link.size}</td>
                                          <td className="px-2 py-1 text-xs">{link.resolution}</td>
                                          <td className="px-2 py-1">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-block px-2 py-0.5 text-xs rounded" style={{ backgroundColor: primaryColor }}>{link.linkText}</a>
                                          </td>
                                          {isAdmin && (
                                            <td className="px-1 py-1">
                                              <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400" onClick={() => handleDeleteLink(link.id)}><Trash2 className="w-3 h-3" /></Button>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="text-xs text-gray-400">No links</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'watch' && (
          <VideoPlayer movieId={movie.id} movieTitle={movie.title} isAdmin={isAdmin} seasons={movie.seasons} movieType={movie.type} movieVideoServers={movie.videoServers} />
        )}

        {activeTab === 'explore' && (
          <div>
            {loadingRelated ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }} /></div>
            ) : relatedMovies.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Related {movie.type === 'series' ? 'Series' : 'Movies'}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {relatedMovies.map((relatedMovie) => (
                    <Link key={relatedMovie.id} href={relatedMovie.type === 'series' ? `/series/${relatedMovie.id}` : `/movie/${relatedMovie.id}`} className="group">
                      <div className="aspect-[2/3] relative rounded overflow-hidden bg-[#1E1E1E]">
                        {relatedMovie.posterPath ? (
                          <Image src={`https://image.tmdb.org/t/p/w300${relatedMovie.posterPath}`} alt={relatedMovie.title || 'Movie'} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-[#2D2D2D] flex items-center justify-center"><Play className="w-8 h-8 text-gray-500" /></div>
                        )}
                        {relatedMovie.quality && <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: primaryColor }}>{relatedMovie.quality}</span>}
                        {relatedMovie.rating > 0 && (
                          <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px]">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" /><span>{relatedMovie.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-1 line-clamp-1">{relatedMovie.title}</p>
                      <p className="text-[10px] text-gray-400">{relatedMovie.releaseDate?.split('-')[0]}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ThumbsUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No related content</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Download Link Dialog */}
      <Dialog open={showAddDownload} onOpenChange={(open) => { setShowAddDownload(open); if (!open) setSelectedEpisodeId(null); }}>
        <DialogContent className="bg-[#1E1E1E] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Download Link
              {selectedEpisodeId && (
                <span className="text-sm text-gray-400 ml-2">
                  (Episode {currentSeason?.episodes.find(e => e.id === selectedEpisodeId)?.episodeNumber})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <Label className="text-xs text-gray-400">Server Name *</Label>
              <Select value={newLink.server} onValueChange={(v) => setNewLink({ ...newLink, server: v })}>
                <SelectTrigger className="bg-[#2D2D2D] border-none h-9 mt-1"><SelectValue placeholder="Select server" /></SelectTrigger>
                <SelectContent>
                  {serverOptions.map((server) => (<SelectItem key={server} value={server}>{server}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input value={newLink.server} onChange={(e) => setNewLink({ ...newLink, server: e.target.value })} placeholder="Or type custom" className="bg-[#2D2D2D] border-none h-9 mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Size *</Label>
                <Input value={newLink.size} onChange={(e) => setNewLink({ ...newLink, size: e.target.value })} placeholder="1.5GB" className="bg-[#2D2D2D] border-none h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Quality *</Label>
                <Select value={newLink.resolution} onValueChange={(v) => setNewLink({ ...newLink, resolution: v })}>
                  <SelectTrigger className="bg-[#2D2D2D] border-none h-9 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {resolutionOptions.map((res) => (<SelectItem key={res} value={res}>{res}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">URL Link *</Label>
              <Input value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="https://..." className="bg-[#2D2D2D] border-none h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Link Text</Label>
              <Input value={newLink.linkText} onChange={(e) => setNewLink({ ...newLink, linkText: e.target.value })} placeholder="Download" className="bg-[#2D2D2D] border-none h-9 mt-1" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 h-9" onClick={() => { setShowAddDownload(false); setSelectedEpisodeId(null); }}>Cancel</Button>
              <Button className="flex-1 h-9" style={{ backgroundColor: primaryColor }} onClick={handleAddDownloadLink}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1E1E1E] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" style={{ color: primaryColor }} />
              Edit Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs text-gray-400">Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="bg-[#2D2D2D] border-none h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Overview</Label>
              <Textarea value={editForm.overview} onChange={(e) => setEditForm({ ...editForm, overview: e.target.value })} className="bg-[#2D2D2D] border-none mt-1 min-h-[100px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Quality</Label>
                <Select value={editForm.quality} onValueChange={(v) => setEditForm({ ...editForm, quality: v })}>
                  <SelectTrigger className="bg-[#2D2D2D] border-none h-9 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                    <SelectItem value="2K">2K</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="Excl">Excl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Runtime (min)</Label>
                <Input value={editForm.runtime} onChange={(e) => setEditForm({ ...editForm, runtime: e.target.value })} placeholder="120" type="number" className="bg-[#2D2D2D] border-none h-9 mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-2 block">Genres</Label>
              <div className="flex flex-wrap gap-2">
                {genreOptions.map((genre) => {
                  const isSelected = editForm.genres.includes(genre);
                  return (
                    <Badge key={genre} variant={isSelected ? 'default' : 'outline'} className={cn('cursor-pointer', isSelected ? '' : 'border-white/20')} style={isSelected ? { backgroundColor: primaryColor } : {}} onClick={() => toggleGenre(genre)}>
                      {genre}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-white/10">
              <Button variant="outline" className="flex-1 h-10" onClick={() => setShowEditDialog(false)}><X className="w-4 h-4 mr-2" />Cancel</Button>
              <Button className="flex-1 h-10" style={{ backgroundColor: primaryColor }} onClick={handleEditSave}><Save className="w-4 h-4 mr-2" />Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
