'use client';

import { useState, useMemo, useEffect } from 'react';
import { Play, Plus, Trash2, Edit, Save, X, Server, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useSettingsStore } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

interface VideoServer {
  id: string;
  name: string;
  url: string;
  episodeId?: string;
}

interface Season {
  id: string;
  seasonNumber: number;
  name: string;
  episodes: Episode[];
}

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  stillPath: string | null;
  videoServers?: VideoServer[];
}

interface MovieVideoServer {
  id: string;
  name: string;
  url: string;
}

interface VideoPlayerProps {
  movieId: string;
  movieTitle: string;
  isAdmin: boolean;
  seasons?: Season[];
  movieType?: 'movie' | 'series';
  movieVideoServers?: MovieVideoServer[];
}

export default function VideoPlayer({ 
  movieId, 
  movieTitle, 
  isAdmin, 
  seasons = [], 
  movieType = 'movie',
  movieVideoServers = [],
}: VideoPlayerProps) {
  const { primaryColor } = useSettingsStore();
  
  // Filter out Season 0 (Specials)
  const validSeasons = useMemo(() => 
    seasons.filter(s => s.seasonNumber > 0).sort((a, b) => a.seasonNumber - b.seasonNumber),
    [seasons]
  );
  
  // Initialize first season and episode
  const firstSeason = useMemo(() => validSeasons[0]?.seasonNumber || 0, [validSeasons]);
  const firstEpisode = useMemo(() => validSeasons[0]?.episodes[0]?.id || null, [validSeasons]);
  
  // State
  const [selectedSeason, setSelectedSeason] = useState<number>(firstSeason);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(firstEpisode);
  const [servers, setServers] = useState<Record<string, VideoServer[]>>({});
  const [movieServers, setMovieServers] = useState<MovieVideoServer[]>(movieVideoServers);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [showAddServer, setShowAddServer] = useState(false);
  const [showEditServer, setShowEditServer] = useState<string | null>(null);
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Get current season and episode
  const currentSeason = useMemo(() => 
    validSeasons.find(s => s.seasonNumber === selectedSeason),
    [validSeasons, selectedSeason]
  );

  const currentEpisode = useMemo(() =>
    currentSeason?.episodes.find(e => e.id === selectedEpisode),
    [currentSeason, selectedEpisode]
  );

  // Get servers for current episode (series) or movie
  const currentServers = useMemo(() => {
    if (movieType === 'movie') {
      return movieServers.map(s => ({ ...s, episodeId: undefined }));
    }
    return selectedEpisode ? (servers[selectedEpisode] || []) : [];
  }, [movieType, movieServers, servers, selectedEpisode]);

  // Get first server id
  const firstServerId = useMemo(() => currentServers[0]?.id || '', [currentServers]);
  
  // Selected server (default to first)
  const activeServer = useMemo(() => {
    if (selectedServer && currentServers.find(s => s.id === selectedServer)) {
      return selectedServer;
    }
    return firstServerId;
  }, [selectedServer, currentServers, firstServerId]);

  // Load episode video servers from database or initial data
  useEffect(() => {
    if (movieType === 'series' && validSeasons.length > 0) {
      const serversMap: Record<string, VideoServer[]> = {};
      
      validSeasons.forEach(season => {
        season.episodes.forEach(episode => {
          if (episode.videoServers && episode.videoServers.length > 0) {
            serversMap[episode.id] = episode.videoServers;
          }
        });
      });
      
      setServers(serversMap);
    }
  }, [movieType, validSeasons]);

  // Set movie servers from props
  useEffect(() => {
    setMovieServers(movieVideoServers);
  }, [movieVideoServers]);

  // Handle season change
  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    const season = validSeasons.find(s => s.seasonNumber === seasonNumber);
    if (season && season.episodes.length > 0) {
      setSelectedEpisode(season.episodes[0].id);
    }
  };

  // Get current video URL
  const currentVideoUrl = useMemo(() => {
    const server = currentServers.find(s => s.id === activeServer);
    return server?.url || '';
  }, [currentServers, activeServer]);

  // Add server
  const handleAddServer = async () => {
    if (!newServerName.trim() || !newServerUrl.trim()) {
      toast({ title: 'Error', description: 'Please enter server name and URL', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/video-servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newServerName.trim(),
          url: newServerUrl.trim(),
          movieId: movieType === 'movie' ? movieId : null,
          episodeId: movieType === 'series' ? selectedEpisode : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const server = data.server;

        if (movieType === 'movie') {
          setMovieServers(prev => [...prev, server]);
        } else if (selectedEpisode) {
          setServers(prev => ({
            ...prev,
            [selectedEpisode]: [...(prev[selectedEpisode] || []), server]
          }));
        }

        setSelectedServer(server.id);
        toast({ title: 'Server Added' });
      } else {
        toast({ title: 'Error', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }

    setNewServerName('');
    setNewServerUrl('');
    setShowAddServer(false);
  };

  // Edit server
  const handleEditServer = async () => {
    if (!showEditServer) return;

    setLoading(true);
    try {
      const res = await fetch('/api/video-servers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: showEditServer,
          url: newServerUrl.trim(),
          type: movieType === 'movie' ? 'movie' : 'episode',
        }),
      });

      if (res.ok) {
        if (movieType === 'movie') {
          setMovieServers(prev => prev.map(s => 
            s.id === showEditServer ? { ...s, url: newServerUrl.trim() } : s
          ));
        } else if (selectedEpisode) {
          setServers(prev => ({
            ...prev,
            [selectedEpisode]: prev[selectedEpisode]?.map(s => 
              s.id === showEditServer ? { ...s, url: newServerUrl.trim() } : s
            ) || []
          }));
        }

        toast({ title: 'Server Updated' });
      } else {
        toast({ title: 'Error', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }

    setShowEditServer(null);
    setNewServerUrl('');
  };

  // Delete server
  const handleDeleteServer = async (serverId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/video-servers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: serverId,
          type: movieType === 'movie' ? 'movie' : 'episode',
        }),
      });

      if (res.ok) {
        if (movieType === 'movie') {
          setMovieServers(prev => prev.filter(s => s.id !== serverId));
        } else if (selectedEpisode) {
          setServers(prev => ({
            ...prev,
            [selectedEpisode]: prev[selectedEpisode]?.filter(s => s.id !== serverId) || []
          }));
        }

        if (selectedServer === serverId) {
          setSelectedServer(currentServers[0]?.id || '');
        }

        toast({ title: 'Server Deleted' });
      } else {
        toast({ title: 'Error', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Season/Episode/Server Selection for Series */}
      {movieType === 'series' && validSeasons.length > 0 && (
        <div className="bg-[#1E1E1E] rounded-lg p-3 space-y-3">
          {/* Season Selection */}
          <div>
            <Label className="text-xs text-gray-400 mb-2 block">Season</Label>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {validSeasons.map((season) => (
                <Button
                  key={season.id}
                  variant={selectedSeason === season.seasonNumber ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs whitespace-nowrap"
                  style={selectedSeason === season.seasonNumber ? { backgroundColor: primaryColor } : { borderColor: '#2D2D2D' }}
                  onClick={() => handleSeasonChange(season.seasonNumber)}
                >
                  {season.name || `Season ${season.seasonNumber}`}
                </Button>
              ))}
            </div>
          </div>

          {/* Episode Selection */}
          {currentSeason && currentSeason.episodes.length > 0 && (
            <div>
              <Label className="text-xs text-gray-400 mb-2 block">Episode</Label>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {currentSeason.episodes.map((episode) => (
                  <Button
                    key={episode.id}
                    variant={selectedEpisode === episode.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs min-w-[40px]"
                    style={selectedEpisode === episode.id ? { backgroundColor: primaryColor } : { borderColor: '#2D2D2D' }}
                    onClick={() => setSelectedEpisode(episode.id)}
                  >
                    {episode.episodeNumber}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Server Selection */}
          {currentServers.length > 0 && (
            <div>
              <Label className="text-xs text-gray-400 mb-2 block">Server</Label>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 items-center">
                {currentServers.map((server) => (
                  <Button
                    key={server.id}
                    variant={activeServer === server.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs whitespace-nowrap"
                    style={activeServer === server.id ? { backgroundColor: primaryColor } : { borderColor: '#2D2D2D' }}
                    onClick={() => setSelectedServer(server.id)}
                  >
                    {server.name}
                  </Button>
                ))}
                {isAdmin && (
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowAddServer(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Add Server button if no servers */}
          {currentServers.length === 0 && isAdmin && (
            <Button size="sm" variant="outline" className="w-full" onClick={() => setShowAddServer(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Server
            </Button>
          )}

          {/* Current playing info */}
          {currentEpisode && (
            <div className="text-xs text-gray-400">
              Now playing: <span className="text-white">Episode {currentEpisode.episodeNumber}</span>
              {currentServers.length > 0 && activeServer && (
                <span> via <span className="text-white">{currentServers.find(s => s.id === activeServer)?.name}</span></span>
              )}
            </div>
          )}
        </div>
      )}

      {/* For Movies - Simple Server Select */}
      {movieType === 'movie' && (
        <div className="bg-[#1E1E1E] rounded-lg p-3">
          {currentServers.length > 0 ? (
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-400" />
              <Select value={activeServer} onValueChange={setSelectedServer}>
                <SelectTrigger className="bg-[#2D2D2D] border-none h-9 flex-1">
                  <SelectValue placeholder="Select Server" />
                </SelectTrigger>
                <SelectContent>
                  {currentServers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>{server.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isAdmin && (
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setShowAddServer(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            isAdmin && (
              <Button size="sm" variant="outline" className="w-full" onClick={() => setShowAddServer(true)}>
                <Plus className="w-4 h-4 mr-2" />Add Server
              </Button>
            )
          )}
        </div>
      )}

      {/* Video Player */}
      <div className="aspect-video bg-[#1E1E1E] rounded-lg overflow-hidden relative">
        {currentVideoUrl ? (
          <iframe
            src={currentVideoUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Play className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-sm">No video source</p>
            {isAdmin && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAddServer(true)}>
                <Plus className="w-3 h-3 mr-1" />Add Video URL
              </Button>
            )}
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
          </div>
        )}
      </div>

      {/* Server List for Admin */}
      {isAdmin && currentServers.length > 0 && (
        <div className="bg-[#1E1E1E] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Servers</h4>
            <span className="text-xs text-gray-400">{currentServers.length}</span>
          </div>
          <div className="space-y-2">
            {currentServers.map((server) => (
              <div key={server.id} className="flex items-center justify-between p-2 rounded bg-[#2D2D2D]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: server.url ? '#22c55e' : '#ef4444' }} />
                  <span className="text-sm">{server.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setNewServerUrl(server.url); setShowEditServer(server.id); }}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => handleDeleteServer(server.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Server Dialog */}
      <Dialog open={showAddServer} onOpenChange={setShowAddServer}>
        <DialogContent className="bg-[#1E1E1E] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Add Server
              {currentEpisode && <span className="text-sm text-gray-400 ml-2">(Ep {currentEpisode.episodeNumber})</span>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <Label className="text-xs text-gray-400">Server Name</Label>
              <Input value={newServerName} onChange={(e) => setNewServerName(e.target.value)} placeholder="Server 1" className="bg-[#2D2D2D] border-none h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Video URL</Label>
              <Input value={newServerUrl} onChange={(e) => setNewServerUrl(e.target.value)} placeholder="https://..." className="bg-[#2D2D2D] border-none h-9 mt-1" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 h-9" onClick={() => { setShowAddServer(false); setNewServerName(''); setNewServerUrl(''); }}>Cancel</Button>
              <Button className="flex-1 h-9" style={{ backgroundColor: primaryColor }} onClick={handleAddServer} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Server Dialog */}
      <Dialog open={!!showEditServer} onOpenChange={() => setShowEditServer(null)}>
        <DialogContent className="bg-[#1E1E1E] border-white/10 text-white max-w-sm">
          <DialogHeader><DialogTitle>Edit Video URL</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <Label className="text-xs text-gray-400">Video URL</Label>
              <Input value={newServerUrl} onChange={(e) => setNewServerUrl(e.target.value)} placeholder="https://..." className="bg-[#2D2D2D] border-none h-9 mt-1" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 h-9" onClick={() => setShowEditServer(null)}><X className="w-4 h-4 mr-1" />Cancel</Button>
              <Button className="flex-1 h-9" style={{ backgroundColor: primaryColor }} onClick={handleEditServer} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />Save</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
