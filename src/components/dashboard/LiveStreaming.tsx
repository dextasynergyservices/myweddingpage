'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Users,
  Settings,
  Play,
  Square,
  Eye,
  Share2,
  Download,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext'; // ✅ updated for Next.js 15 App Router

interface StreamConfig {
  id: string;
  name: string;
  camera: string;
  quality: string;
  isActive: boolean;
  viewerCount: number;
}

interface Viewer {
  id: string;
  name: string;
  joinTime: string;
  device: 'desktop' | 'mobile' | 'tablet';
}

const LiveStreaming = () => {
  const { isDarkMode } = useTheme();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamConfigs, setStreamConfigs] = useState<StreamConfig[]>([
    {
      id: '1',
      name: 'Main Ceremony',
      camera: 'Camera 1',
      quality: '1080p',
      isActive: true,
      viewerCount: 45
    },
    {
      id: '2',
      name: 'Reception Hall',
      camera: 'Camera 2',
      quality: '720p',
      isActive: false,
      viewerCount: 0
    }
  ]);

  const [viewers, setViewers] = useState<Viewer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      joinTime: '14:30',
      device: 'desktop'
    },
    {
      id: '2',
      name: 'Michael Brown',
      joinTime: '14:32',
      device: 'mobile'
    },
    {
      id: '3',
      name: 'Lisa Davis',
      joinTime: '14:35',
      device: 'tablet'
    }
  ]);

  const [streamSettings, setStreamSettings] = useState({
    isPublic: true,
    requirePassword: false,
    password: '',
    allowChat: true,
    recordStream: true,
    maxViewers: 100
  });

  const totalViewers = streamConfigs.reduce((sum, config) => sum + config.viewerCount, 0);

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      setStreamConfigs(configs =>
        configs.map(config => ({ ...config, isActive: true, viewerCount: Math.floor(Math.random() * 50) + 10 }))
      );
    } else {
      setStreamConfigs(configs =>
        configs.map(config => ({ ...config, isActive: false, viewerCount: 0 }))
      );
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Monitor;
      default:
        return Monitor;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-light mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Live Streaming
          </h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Share your special moments with loved ones around the world
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-2xl hover:bg-slate-700 transition-all duration-300">
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <button
            onClick={toggleStream}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
              isStreaming
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg text-white'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="h-5 w-5" />
                Stop Stream
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stream Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Stream Status', value: isStreaming ? 'Live' : 'Offline', icon: Video, color: isStreaming ? 'from-red-500 to-red-600' : 'from-slate-500 to-slate-600' },
          { title: 'Total Viewers', value: totalViewers.toString(), icon: Eye, color: 'from-blue-500 to-indigo-600' },
          { title: 'Active Cameras', value: streamConfigs.filter(c => c.isActive).length.toString(), icon: Camera, color: 'from-purple-500 to-pink-600' },
          { title: 'Stream Quality', value: '1080p', icon: BarChart3, color: 'from-emerald-500 to-teal-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-3xl p-6 shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.title}</p>
                <p className={`text-3xl font-light mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              </div>
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Camera Feeds */}
      <div className={`rounded-3xl p-8 shadow-lg border ${
        isDarkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-100'
      }`}>
        <h2 className={`text-2xl font-light mb-6 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Camera Feeds
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {streamConfigs.map((config, index) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden border-2 ${
                config.isActive
                  ? 'border-red-500'
                  : isDarkMode ? 'border-slate-600' : 'border-slate-300'
              }`}
            >
              {/* Video Preview */}
              <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                {config.isActive ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-semibold">Live Stream Active</p>
                      <p className="text-sm opacity-80">{config.viewerCount} viewers</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <VideoOff className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">Camera Offline</p>
                  </div>
                )}

                {/* Live Indicator */}
                {config.isActive && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                )}

                {/* Viewer Count */}
                {config.isActive && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {config.viewerCount}
                  </div>
                )}
              </div>

              {/* Camera Info */}
              <div className={`p-4 ${
                isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {config.name}
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {config.camera} • {config.quality}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'text-slate-400 hover:bg-slate-600 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}>
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${
                      config.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}>
                      {config.isActive ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>


      {/* Live Viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`rounded-3xl p-6 shadow-lg border ${
          isDarkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-100'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Live Viewers
          </h2>

          <div className="space-y-4">
            {viewers.map((viewer, index) => {
              const DeviceIcon = getDeviceIcon(viewer.device);

              return (
                <motion.div
                  key={viewer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl ${
                    isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {viewer.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <DeviceIcon className={`h-4 w-4 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`} />
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                        Joined at {viewer.joinTime}
                      </span>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stream Settings */}
        <div className={`rounded-3xl p-6 shadow-lg border ${
          isDarkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-100'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Stream Settings
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Public Stream
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Allow anyone with the link to watch
                </p>
              </div>
              <button
                onClick={() => setStreamSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  streamSettings.isPublic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    streamSettings.isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Password Protection
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Require password to join stream
                </p>
              </div>
              <button
                onClick={() => setStreamSettings(prev => ({ ...prev, requirePassword: !prev.requirePassword }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  streamSettings.requirePassword ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    streamSettings.requirePassword ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Record Stream
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Save recording for later viewing
                </p>
              </div>
              <button
                onClick={() => setStreamSettings(prev => ({ ...prev, recordStream: !prev.recordStream }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  streamSettings.recordStream ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    streamSettings.recordStream ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {streamSettings.requirePassword && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Stream Password
                </label>
                <input
                  type="password"
                  value={streamSettings.password}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-2xl border transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="Enter password"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors">
                <Share2 className="h-4 w-4" />
                Share Stream Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreaming;
