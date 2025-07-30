'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Camera,
  Music,
  Utensils,
  Car,
  Palette
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Vendor {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  rating: number;
  reviews: number;
  price: number;
  status: 'contacted' | 'booked' | 'paid' | 'completed';
  contractSigned: boolean;
  notes?: string;
  services: string[];
}

const VendorPortal = () => {
  const { isDarkMode } = useTheme();
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: '1',
      name: 'Garden Valley Estate',
      category: 'Venue',
      email: 'info@gardenvalley.com',
      phone: '+1-555-0123',
      website: 'gardenvalley.com',
      address: '123 Garden Lane, Valley City',
      rating: 4.8,
      reviews: 127,
      price: 8500,
      status: 'booked',
      contractSigned: true,
      services: ['Venue', 'Catering', 'Setup']
    },
    {
      id: '2',
      name: 'John Photography',
      category: 'Photography',
      email: 'john@photography.com',
      phone: '+1-555-0456',
      address: '456 Photo Street, City',
      rating: 4.9,
      reviews: 89,
      price: 2800,
      status: 'paid',
      contractSigned: true,
      services: ['Wedding Photography', 'Engagement Session', 'Photo Album']
    },
    {
      id: '3',
      name: 'Bloom Studio',
      category: 'Florist',
      email: 'hello@bloomstudio.com',
      phone: '+1-555-0789',
      address: '789 Flower Ave, Garden City',
      rating: 4.7,
      reviews: 56,
      price: 1200,
      status: 'contacted',
      contractSigned: false,
      services: ['Bridal Bouquet', 'Centerpieces', 'Ceremony Decor']
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = [
    { id: 'all', label: 'All Categories', count: vendors.length },
    { id: 'Venue', label: 'Venue', count: vendors.filter(v => v.category === 'Venue').length },
    { id: 'Photography', label: 'Photography', count: vendors.filter(v => v.category === 'Photography').length },
    { id: 'Florist', label: 'Florist', count: vendors.filter(v => v.category === 'Florist').length },
    { id: 'Catering', label: 'Catering', count: vendors.filter(v => v.category === 'Catering').length },
    { id: 'Music', label: 'Music', count: vendors.filter(v => v.category === 'Music').length }
  ];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'paid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'booked':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'contacted':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'paid':
        return <DollarSign className="h-4 w-4" />;
      case 'booked':
        return <Calendar className="h-4 w-4" />;
      case 'contacted':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Photography':
        return Camera;
      case 'Music':
        return Music;
      case 'Catering':
        return Utensils;
      case 'Transportation':
        return Car;
      case 'Florist':
        return Palette;
      default:
        return Users;
    }
  };

  const updateVendorStatus = (id: string, newStatus: string) => {
    setVendors(vendors.map(vendor =>
      vendor.id === id ? { ...vendor, status: newStatus as any } : vendor
    ));
  };

  return (
<div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-light mb-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Vendor Portal
          </h1>
          <p className={`${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Manage your wedding vendors and track contracts
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300">
          <Plus className="h-5 w-5" />
          Add Vendor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Vendors', value: vendors.length, icon: Users, color: 'from-blue-500 to-indigo-600' },
          { title: 'Booked', value: vendors.filter(v => v.status === 'booked' || v.status === 'paid').length, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
          { title: 'Contracts Signed', value: vendors.filter(v => v.contractSigned).length, icon: FileText, color: 'from-purple-500 to-pink-600' },
          { title: 'Total Cost', value: `$${vendors.reduce((sum, v) => sum + v.price, 0).toLocaleString()}`, icon: DollarSign, color: 'from-amber-500 to-orange-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-3xl p-6 shadow-lg border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-light mt-1 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className={`rounded-3xl p-6 shadow-lg border ${
        isDarkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            />
          </div>

          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-4 py-3 rounded-2xl border transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label} ({category.count})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 rounded-2xl border transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
            >
              <option value="all">All Status</option>
              <option value="contacted">Contacted</option>
              <option value="booked">Booked</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredVendors.map((vendor, index) => {
          const CategoryIcon = getCategoryIcon(vendor.category);

          return (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {vendor.name}
                    </h3>
                    <p className={`${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {vendor.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(vendor.status)
                  }`}>
                    {getStatusIcon(vendor.status)}
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Rating and Price */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(vendor.rating)
                            ? 'text-amber-400 fill-current'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {vendor.rating} ({vendor.reviews} reviews)
                  </span>
                </div>
                <div className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  ${vendor.price.toLocaleString()}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className={`flex items-center gap-3 text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Mail className="h-4 w-4" />
                  {vendor.email}
                </div>
                <div className={`flex items-center gap-3 text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Phone className="h-4 w-4" />
                  {vendor.phone}
                </div>
                <div className={`flex items-center gap-3 text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <MapPin className="h-4 w-4" />
                  {vendor.address}
                </div>
              </div>

              {/* Services */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {vendor.services.map((service, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDarkMode
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contract Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {vendor.contractSigned ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        Contract Signed
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-amber-400' : 'text-amber-600'
                      }`}>
                        Contract Pending
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Contact
                </button>
                <button className={`p-2 rounded-xl transition-colors ${
                  isDarkMode
                    ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}>
                  <Edit className="h-4 w-4" />
                </button>
                <button className={`p-2 rounded-xl transition-colors ${
                  isDarkMode
                    ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}>
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorPortal;
