import { useState } from 'react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Heart, Search, Filter, MoreHorizontal } from 'lucide-react';

interface FavouritesPageProps {}

export default function FavouritesPage({}: FavouritesPageProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const favouriteItems = [
    { id: 1, title: 'Mountain Retreat Venue', category: 'SpaceX', rating: 4.8, price: '$500/day', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=400&auto=format&fit=crop' },
    { id: 2, title: 'Corporate Workshop Package', category: 'Activity', rating: 4.9, price: '$150/person', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop' },
    { id: 3, title: 'Premium Welcome Kit', category: 'Gifting', rating: 4.7, price: '$75/kit', image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=400&auto=format&fit=crop' },
    { id: 4, title: 'Downtown Tech Hub Desk', category: 'Coworking', rating: 4.6, price: '$40/day', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop' },
  ];

  return (
    <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
      <SharedSidebar collapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
      
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={toggleSidebar} />
        
        <MogzuCorporateScrollSurface>
          <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                  Your Favourites
                </h1>
                <p className="text-gray-500 mt-1">Manage and review your shortlisted categories and items</p>
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search favourites..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favouriteItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm">
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white">
                      {item.category === 'SpaceX' ? 'D Space' : item.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1 pr-2">{item.title}</h3>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500 font-medium">{item.price}</span>
                    </div>
                    <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {favouriteItems.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favourites yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Explore spaces, activities, and products to start building your shortlist of favourites.</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Explore Catalogue
                </button>
              </div>
            )}
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}