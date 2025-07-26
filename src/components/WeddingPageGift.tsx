'use client';

import { useTheme } from '../contexts/ThemeContext';
import { Heart, Calendar, MapPin, ArrowLeft } from 'lucide-react';

export default function WeddingPageGift() {

    const { isDarkMode } = useTheme();

    const giftRegistry = [
        { id: 1, item: 'Kitchen Stand Mixer', price: '$299', image: 'https://images.pexels.com/photos/4226906/pexels-photo-4226906.jpeg?auto=compress&cs=tinysrgb&w=300', purchased: false },
        { id: 2, item: 'Fine China Dinnerware Set', price: '$199', image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=300', purchased: true },
        { id: 3, item: 'Luxury Bedding Set', price: '$150', image: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=300', purchased: false },
        { id: 4, item: 'Coffee Machine', price: '$249', image: 'https://images.pexels.com/photos/4226924/pexels-photo-4226924.jpeg?auto=compress&cs=tinysrgb&w=300', purchased: false }
      ];
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
                Gift Registry
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full mb-6"></div>
              <p className={`text-lg font-light max-w-2xl mx-auto ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Your presence is the only present we need, but if you'd like to give a gift, here are some ideas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {giftRegistry.map(gift => (
                <div key={gift.id} className="group h-full">
                  <div className={`rounded-3xl p-6 hover:shadow-lg transition-all duration-300 border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 hover:border-slate-500'
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}>
                    <img
                      src={gift.image}
                      alt={gift.item}
                      className="w-full h-48 object-cover rounded-2xl mb-6"
                    />
                    <h3 className={`font-semibold mb-2 text-lg ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {gift.item}
                    </h3>
                    <p className={`mb-6 text-lg font-light ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {gift.price}
                    </p>
                    <button
                      disabled={gift.purchased}
                      className={`w-full py-3 px-6 rounded-2xl font-medium transition-all duration-300 ${
                        gift.purchased
                          ? isDarkMode
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                      }`}
                    >
                      {gift.purchased ? 'Already Purchased' : 'Purchase'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
    );
};