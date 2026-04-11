'use client';

import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import { useSidebarStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const movieGenres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const seriesGenres = [
  'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Kids', 'Mystery', 'News', 'Reality',
  'Sci-Fi & Fantasy', 'Soap', 'Talk', 'War & Politics'
];

const movieTags = [
  '4K', 'Animation', 'Anime', 'Bollywood', 'C Drama', 'Donghua',
  'Featured Movies', 'K Drama', 'Reality Show', 'Thai Drama', 'Trending'
];

const seriesTags = [
  '4K', 'Animation', 'Anime', 'Bollywood', 'C Drama', 'Donghua',
  'Featured Series', 'K Drama', 'Reality Show', 'Thai Drama', 'Trending'
];

const movieCollections = [
  '007', 'A24 Movies', 'American Pie', 'Batman', 'CHRISTMAS MOVIES',
  'DCEU', 'Detective Chinatown', 'Dragon Gate Posthouse', 'Fast and Furious',
  'Final Destination', 'Harry Potter', 'Marvel Cinematic Universe-MCU',
  "Ocean's Collection", 'Queen Of Kung Fu', 'Saw Collection', 'Scooby-Doo',
  'Studio Ghibli', 'Thai GDH', 'Tom & Jerry', 'Transformers'
];

const seriesCollections = [
  'Sit-com', 'Sports Documentaries'
];

export default function GenresPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('genres');

  const handleGenreClick = (genre: string, type: 'movie' | 'series') => {
    const encodedGenre = encodeURIComponent(genre);
    const route = type === 'movie' ? 'movies' : 'series';
    router.push(`/${route}?genre=${encodedGenre}`);
  };

  const handleTagClick = (tag: string, type: 'movie' | 'series') => {
    const encodedTag = encodeURIComponent(tag);
    const route = type === 'movie' ? 'movies' : 'series';
    router.push(`/${route}?tag=${encodedTag}`);
  };

  const handleCollectionClick = (collection: string, type: 'movie' | 'series') => {
    const encodedCollection = encodeURIComponent(collection);
    const route = type === 'movie' ? 'movies' : 'series';
    router.push(`/${route}?collection=${encodedCollection}`);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-red-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Genres</h1>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#1E1E1E] w-full justify-start">
              <TabsTrigger
                value="genres"
                className="data-[state=active]:bg-transparent"
                style={activeTab === 'genres' ? { color: 'var(--dynamic-primary, #E53935)' } : {}}
              >
                Genres
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="data-[state=active]:bg-transparent"
                style={activeTab === 'tags' ? { color: 'var(--dynamic-primary, #E53935)' } : {}}
              >
                Tags
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                className="data-[state=active]:bg-transparent"
                style={activeTab === 'collections' ? { color: 'var(--dynamic-primary, #E53935)' } : {}}
              >
                Collections
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Genres Tab */}
        {activeTab === 'genres' && (
          <div className="px-4">
            {/* Movies */}
            <h3 className="text-lg font-semibold mb-3">Movies</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {movieGenres.map((genre) => (
                <Button
                  key={genre}
                  variant="outline"
                  className="genre-button h-auto py-3 text-sm"
                  style={{ borderColor: '#008B8B' }}
                  onClick={() => handleGenreClick(genre, 'movie')}
                >
                  {genre}
                </Button>
              ))}
            </div>

            {/* Series */}
            <h3 className="text-lg font-semibold mb-3">Series</h3>
            <div className="grid grid-cols-3 gap-2">
              {seriesGenres.map((genre) => (
                <Button
                  key={genre}
                  variant="outline"
                  className="genre-button h-auto py-3 text-sm"
                  style={{ borderColor: '#008B8B' }}
                  onClick={() => handleGenreClick(genre, 'series')}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="px-4">
            {/* Movies */}
            <h3 className="text-lg font-semibold mb-3">Movies</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {movieTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  className="genre-button h-auto py-3 text-sm"
                  style={{ borderColor: '#008B8B' }}
                  onClick={() => handleTagClick(tag, 'movie')}
                >
                  {tag}
                </Button>
              ))}
            </div>

            {/* Series */}
            <h3 className="text-lg font-semibold mb-3">Series</h3>
            <div className="grid grid-cols-3 gap-2">
              {seriesTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  className="genre-button h-auto py-3 text-sm"
                  style={{ borderColor: '#008B8B' }}
                  onClick={() => handleTagClick(tag, 'series')}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <div className="px-4">
            {/* Movies */}
            <h3 className="text-lg font-semibold mb-3">Movies</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {movieCollections.map((collection) => (
                <Button
                  key={collection}
                  variant="outline"
                  className="genre-button h-auto py-3 text-xs"
                  style={{ borderColor: '#008B8B' }}
                  onClick={() => handleCollectionClick(collection, 'movie')}
                >
                  {collection}
                </Button>
              ))}
            </div>

            {/* Series */}
            <h3 className="text-lg font-semibold mb-3">Series</h3>
            <div className="grid grid-cols-3 gap-2">
              {seriesCollections.map((collection) => (
                <Button
                  key={collection}
                  variant="outline"
                  className="genre-button h-auto py-3 text-sm"
                  style={{ borderColor: '#008B8B' }}
                  onClick={() => handleCollectionClick(collection, 'series')}
                >
                  {collection}
                </Button>
              ))}
            </div>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
