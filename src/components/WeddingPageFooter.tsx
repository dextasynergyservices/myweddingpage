"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Calendar,
  MapPin,
  Mail,
  Instagram,
  Facebook,
} from "lucide-react";
import Image from "next/image";

interface WeddingPageFooterProps {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  venue?: string;
  email?: string;
  logoUrl?: string;
  logoAlt?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
  };
  guestMessageCount?: number;
}

export default function WeddingPageFooter({
  brideName = "Bride",
  groomName = "Groom",
  weddingDate,
  venue,
  email,
  logoUrl,
  logoAlt,
  socialMedia,
}: WeddingPageFooterProps) {
  // Format wedding date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <footer className="bg-gradient-to-br from-pink-50 via-white to-rose-50 border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Couple Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              {/* Custom Logo or Default Heart Icon */}
              {logoUrl ? (
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                  <Image
                    src={logoUrl}
                    alt={logoAlt || "Wedding Logo"}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <Heart className="h-6 w-6 text-pink-500" />
              )}

              {/* Couple Names */}
              <h3 className="text-xl font-bold text-gray-800">
                {groomName} & {brideName}
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Thank you for being part of our special day. Your love and support
              mean the world to us.
            </p>
          </motion.div>

          {/* Wedding Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center md:text-left"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Wedding Details
            </h4>
            <div className="space-y-3">
              {weddingDate && (
                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-pink-500" />
                  <span className="text-sm">{formatDate(weddingDate)}</span>
                </div>
              )}
              {venue && (
                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-pink-500" />
                  <span className="text-sm">{venue}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center md:text-left"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Get In Touch
            </h4>
            <div className="space-y-3">
              {email && (
                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                  <Mail className="h-4 w-4 text-pink-500" />
                  <a
                    href={`mailto:${email}`}
                    className="text-sm hover:text-pink-600 transition-colors duration-200"
                  >
                    {email}
                  </a>
                </div>
              )}
              {/* {whatsapp && (
                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                  <Phone className="h-4 w-4 text-pink-500" />
                  <a
                    href={`tel:${whatsapp}`}
                    className="text-sm hover:text-pink-600 transition-colors duration-200"
                  >
                    {whatsapp}
                  </a>
                </div>
              )} */}
            </div>

            {/* Social Media */}
            {(socialMedia?.instagram || socialMedia?.facebook) && (
              <div className="flex items-center justify-center md:justify-start space-x-3 mt-4">
                {socialMedia.instagram && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors duration-200"
                  >
                    <Instagram className="h-4 w-4" />
                  </motion.a>
                )}
                {socialMedia.facebook && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors duration-200"
                  >
                    <Facebook className="h-4 w-4" />
                  </motion.a>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-8 border-t border-pink-200"
        >
          <p className="text-md text-gray-500">
            Created using{" "}
            <a href="https://myweddingpage.online" target="_blank">
              myweddingpage.online
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
