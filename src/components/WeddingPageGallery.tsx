'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const photos = [
    { id: 1, category: 'before', url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Engagement Session' },
    { id: 2, category: 'before', url: 'https://images.pexels.com/photos/1024866/pexels-photo-1024866.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Getting Ready' },
    { id: 3, category: 'during', url: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Ceremony' },
    { id: 4, category: 'during', url: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'First Dance' },
    { id: 5, category: 'after', url: 'https://images.pexels.com/photos/1444531/pexels-photo-1444531.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Reception' },
    { id: 6, category: 'after', url: 'https://images.pexels.com/photos/1024867/pexels-photo-1024867.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Celebration' }
  ];

export default function WeddingPageGallery() {

    const { isDarkMode } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPhotos =
    selectedCategory === 'all'
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

    return(
        <div className={`rounded-3xl p-12 shadow-lg border mb-16 ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
          }`}>
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-light mb-6 tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Our Wedding Gallery
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full mb-8"></div>

              {/* Category Filter */}
              <div className="flex justify-center gap-3 mb-12 flex-wrap">
                {['all', 'before', 'during', 'after'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : isDarkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {category === 'all' ? 'All Photos' : `${category.charAt(0).toUpperCase() + category.slice(1)} Wedding`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPhotos.map(photo => (
                <div key={photo.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-3xl shadow-lg">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="font-medium text-lg">{photo.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    );

}