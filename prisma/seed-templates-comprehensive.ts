import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// Template categories with their IDs
const CATEGORIES = {
  CLASSIC: "cc4b45c4-9a45-4bf8-85d9-192144d43c87",
  MODERN: "a42c553a-cac8-497b-ad4b-5127f270d4ed",
  MINIMALIST: "3e44f777-32a8-4182-80d5-d66ace42ce70",
  LUXURY: "787f203e-01f6-43d2-a36b-51d5f4ee3786",
};

// Plan IDs
const PLANS = {
  DELIGHT: "8838eb28-4dde-4847-a821-fd6a92edc7e7",
  DARLING: "c883dbff-0982-43fd-8621-d4e8bcd2e48f",
  DAZZLE: "5caaccb9-6e14-4a53-a49a-177de72b0ccf",
  DYNASTY_ROYALE: "3b4634ab-3a88-46b4-aff6-78306099620e",
};

// Template configurations with unique styling and content
const TEMPLATES = {
  vows: {
    name: "Vows",
    description:
      "A classic, timeless wedding template with elegant typography and romantic styling. Perfect for traditional couples who love vintage charm and sophisticated elegance.",
    categoryId: CATEGORIES.CLASSIC,
    thumbnail: "/thumbnail/vows_thumbnail.png",
    heroImage: "/templates/vows/assets/hero-wedding.jpg",
    planIds: [PLANS.DELIGHT, PLANS.DARLING, PLANS.DAZZLE, PLANS.DYNASTY_ROYALE],
    assets: [
      "/templates/vows/assets/hero-wedding.jpg",
      "/templates/vows/assets/story-image-1.jpg",
      "/templates/vows/assets/story-image-2.jpg",
      "/templates/vows/assets/gallery-1.jpg",
      "/templates/vows/assets/gallery-2.jpg",
    ],
    colorSchemes: [
      {
        name: "Classic Gold",
        primary: "#D4AF37",
        secondary: "#8B4513",
        accent: "#F5F5DC",
        background: "#FFFFFF",
        text: "#2C2C2C",
        description: "Timeless gold and cream elegance",
      },
      {
        name: "Romantic Rose",
        primary: "#E91E63",
        secondary: "#C2185B",
        accent: "#F8BBD9",
        background: "#FFF8F8",
        text: "#2C2C2C",
        description: "Soft rose and pink romance",
      },
      {
        name: "Vintage Ivory",
        primary: "#8B4513",
        secondary: "#D2691E",
        accent: "#F5DEB3",
        background: "#FFFEF7",
        text: "#2F2F2F",
        description: "Warm vintage ivory and brown",
      },
    ],
    layout_data: {
      fontFamily: "serif",
      layout: "classic_centered",
      spacing: "comfortable",
      animations: "subtle",
    },
    components: {
      hero: {
        style: "classic_script",
        layout: "centered_overlay",
        elements: ["couple_names", "date", "venue", "cta_button"],
      },
      story: {
        style: "timeline_vertical",
        layout: "alternating_images",
        elements: ["story_text", "milestone_images", "timeline_dates"],
      },
      gallery: {
        style: "grid_classic",
        layout: "masonry",
        elements: ["image_grid", "category_filters", "lightbox"],
      },
    },
  },
  bloom: {
    name: "Bloom",
    description:
      "A luxurious, romantic template with floral elements and rich colors. Perfect for couples who love nature, flowers, and dreamy romantic aesthetics.",
    categoryId: CATEGORIES.LUXURY,
    thumbnail: "/thumbnail/bloom_thumbnail.png",
    heroImage: "/templates/bloom/assets/wedding-hero.jpg",
    planIds: [PLANS.DELIGHT, PLANS.DARLING, PLANS.DAZZLE, PLANS.DYNASTY_ROYALE],
    assets: [
      "/templates/bloom/assets/wedding-hero.jpg",
      "/templates/bloom/assets/couple-portrait.jpg",
      "/templates/bloom/assets/wedding-bouquet.jpg",
      "/templates/bloom/assets/wedding-celebration.jpg",
      "/templates/bloom/assets/wedding-details-1.jpg",
    ],
    colorSchemes: [
      {
        name: "Romantic Blush",
        primary: "#E91E63",
        secondary: "#C2185B",
        accent: "#F8BBD9",
        background: "#FFF8F8",
        text: "#2C2C2C",
        description: "Soft pink and rose romance",
      },
      {
        name: "Garden Green",
        primary: "#4CAF50",
        secondary: "#388E3C",
        accent: "#C8E6C9",
        background: "#F1F8E9",
        text: "#1B5E20",
        description: "Fresh garden greens and nature",
      },
      {
        name: "Lavender Dreams",
        primary: "#9C27B0",
        secondary: "#7B1FA2",
        accent: "#E1BEE7",
        background: "#F3E5F5",
        text: "#4A148C",
        description: "Dreamy lavender and purple",
      },
    ],
    layout_data: {
      fontFamily: "script",
      layout: "romantic_flowing",
      spacing: "generous",
      animations: "romantic_float",
    },
    components: {
      hero: {
        style: "romantic_floral",
        layout: "split_image_text",
        elements: ["floating_hearts", "couple_names", "date", "romantic_quote", "cta_buttons"],
      },
      story: {
        style: "romantic_timeline",
        layout: "image_centered",
        elements: ["love_story", "milestone_cards", "floating_elements"],
      },
      gallery: {
        style: "masonry_romantic",
        layout: "pinterest_style",
        elements: ["image_masonry", "floral_overlays", "romantic_filters"],
      },
    },
  },
  elegance: {
    name: "Elegance",
    description:
      "A minimalist, sophisticated template with clean lines and modern aesthetics. Perfect for contemporary couples who appreciate simplicity and refined elegance.",
    categoryId: CATEGORIES.MINIMALIST,
    thumbnail: "/thumbnail/elegance_thumbnail.png",
    heroImage: "/templates/elegance/assets/wedding-hero.jpg",
    planIds: [PLANS.DARLING, PLANS.DAZZLE, PLANS.DYNASTY_ROYALE],
    assets: [
      "/templates/elegance/assets/wedding-hero.jpg",
      "/templates/elegance/assets/couple-story1.jpg",
      "/templates/elegance/assets/couple-story2.jpg",
      "/templates/elegance/assets/gallery-preview.jpg",
    ],
    colorSchemes: [
      {
        name: "Minimalist White",
        primary: "#000000",
        secondary: "#666666",
        accent: "#F5F5F5",
        background: "#FFFFFF",
        text: "#2C2C2C",
        description: "Pure white and black minimalism",
      },
      {
        name: "Soft Gray",
        primary: "#424242",
        secondary: "#757575",
        accent: "#E0E0E0",
        background: "#FAFAFA",
        text: "#212121",
        description: "Soft grays and subtle tones",
      },
      {
        name: "Warm Beige",
        primary: "#8D6E63",
        secondary: "#A1887F",
        accent: "#F5F5F5",
        background: "#FFFEF7",
        text: "#3E2723",
        description: "Warm beige and earth tones",
      },
    ],
    layout_data: {
      fontFamily: "sans-serif",
      layout: "clean_grid",
      spacing: "precise",
      animations: "subtle_fade",
    },
    components: {
      hero: {
        style: "minimalist_split",
        layout: "image_text_split",
        elements: ["clean_typography", "couple_names", "date", "simple_cta"],
      },
      story: {
        style: "clean_timeline",
        layout: "vertical_clean",
        elements: ["story_cards", "clean_images", "minimal_text"],
      },
      gallery: {
        style: "grid_clean",
        layout: "uniform_grid",
        elements: ["square_grid", "clean_overlays", "minimal_filters"],
      },
    },
  },
  luxe: {
    name: "Luxe",
    description:
      "A modern, premium template with contemporary design and luxury elements. Perfect for sophisticated couples who want cutting-edge design and premium aesthetics.",
    categoryId: CATEGORIES.MODERN,
    thumbnail: "/thumbnail/luxe_thumbnail.png",
    heroImage:
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
    planIds: [PLANS.DYNASTY_ROYALE],
    assets: [
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    colorSchemes: [
      {
        name: "Luxury Gold",
        primary: "#FFD700",
        secondary: "#B8860B",
        accent: "#FFF8DC",
        background: "#1A1A1A",
        text: "#FFFFFF",
        description: "Rich gold on dark luxury",
      },
      {
        name: "Royal Purple",
        primary: "#9C27B0",
        secondary: "#7B1FA2",
        accent: "#E1BEE7",
        background: "#F3E5F5",
        text: "#4A148C",
        description: "Royal purple and lavender",
      },
      {
        name: "Platinum Silver",
        primary: "#C0C0C0",
        secondary: "#808080",
        accent: "#F5F5F5",
        background: "#2C2C2C",
        text: "#FFFFFF",
        description: "Sophisticated platinum and silver",
      },
    ],
    layout_data: {
      fontFamily: "modern",
      layout: "dynamic_grid",
      spacing: "dramatic",
      animations: "premium_effects",
    },
    components: {
      hero: {
        style: "luxury_showcase",
        layout: "fullscreen_parallax",
        elements: ["dramatic_typography", "floating_elements", "premium_animations", "luxury_cta"],
      },
      story: {
        style: "premium_timeline",
        layout: "interactive_cards",
        elements: ["premium_cards", "interactive_elements", "luxury_animations"],
      },
      gallery: {
        style: "premium_masonry",
        layout: "dynamic_grid",
        elements: ["premium_grid", "hover_effects", "luxury_overlays"],
      },
    },
  },
};

// Template-specific sample data for preview - each template has unique content
const TEMPLATE_SAMPLE_DATA = {
  vows: {
    // Classic, traditional couple
    brideName: "Sarah",
    groomName: "Michael",
    weddingDate: "October 15, 2024",
    venue: "Napa Valley Winery, California",
    welcomeMessage:
      "Together Forever - Join us as we celebrate our love and begin our forever together.",
    storyContent:
      "Every love story is beautiful, but ours is our favorite. From our first meeting at the local coffee shop to this magical moment, here's how our journey began. It was a beautiful spring afternoon when Michael accidentally spilled his coffee on Sarah's favorite book. What started as an embarrassing moment turned into the most wonderful conversation that lasted for hours.",
    storyMilestones: [
      {
        date: "March 2018",
        title: "How We Met",
        description:
          "It was a beautiful spring afternoon at the local coffee shop. Sarah was reading her favorite book when Michael accidentally spilled his coffee. What started as an embarrassing moment turned into the most wonderful conversation that lasted for hours.",
      },
      {
        date: "December 2019",
        title: "First Adventure",
        description:
          "Our first trip together to the mountains. We knew we were meant to explore the world side by side, creating memories that would last a lifetime.",
      },
      {
        date: "2022",
        title: "The Proposal",
        description:
          "On a snowy December evening, Michael took Sarah back to that same coffee shop where they first met. As the snow fell gently outside, he got down on one knee and asked her to be his forever.",
      },
    ],
    galleryImages: [
      "/templates/vows/assets/gallery-1.jpg",
      "/templates/vows/assets/gallery-2.jpg",
      "/templates/vows/assets/story-image-1.jpg",
      "/templates/vows/assets/story-image-2.jpg",
      "/templates/vows/assets/hero-wedding.jpg",
    ],
    galleryVideos: [
      {
        id: "vows-video-1",
        title: "Classic Ceremony Highlights",
        thumbnail: "/templates/vows/assets/gallery-1.jpg",
        duration: "3:15",
        category: "during",
      },
      {
        id: "vows-video-2",
        title: "Engagement Story",
        thumbnail: "/templates/vows/assets/story-image-1.jpg",
        duration: "2:30",
        category: "before",
      },
    ],
    gifts: [
      {
        id: "vows-gift-1",
        name: "Dining Table Set",
        description: "Beautiful oak dining table for our new home - perfect for family dinners",
        price: "₦1,200,000",
        image:
          "https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Home & Living",
      },
      {
        id: "vows-gift-2",
        name: "Kitchen Mixer",
        description: "Professional stand mixer for baking together on Sunday mornings",
        price: "₦350,000",
        image:
          "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Kitchen",
      },
      {
        id: "vows-gift-3",
        name: "Bedding Set",
        description: "Luxury cotton bedding set, king size for our master bedroom",
        price: "₦200,000",
        image:
          "https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Bedroom",
      },
    ],
    guestMessages: [
      {
        id: "vows-guest-1",
        name: "Emily Rodriguez",
        message:
          "So excited to celebrate with you both! Your love story is truly inspiring and I cannot wait to see you walk down the aisle. Wishing you a lifetime of happiness! 💕",
        timestamp: "2 days ago",
      },
      {
        id: "vows-guest-2",
        name: "David Chen",
        message:
          "Congratulations to the beautiful couple! I have had the pleasure of watching your relationship grow over the years. Here's to your new adventure together!",
        timestamp: "3 days ago",
      },
    ],
    bankDetails: [
      {
        id: "vows-bank-1",
        bankName: "First Bank",
        accountName: "Sarah & Michael Wedding Fund",
        accountNumber: "1234567890",
      },
    ],
  },
  bloom: {
    // Romantic, floral couple
    brideName: "Sarah",
    groomName: "James",
    weddingDate: "June 15, 2024",
    venue: "Rose Garden Estate, Napa Valley",
    welcomeMessage:
      "Two hearts, one beautiful journey. Join us as we celebrate our love and begin our forever together.",
    storyContent:
      "What started as a chance encounter at our favorite coffee shop has blossomed into a love that fills our hearts with joy every single day. We've laughed together, dreamed together, and supported each other through all of life's beautiful moments. From quiet Sunday mornings to adventurous weekend getaways, we've built a foundation of friendship, trust, and unconditional love.",
    storyMilestones: [
      {
        date: "March 2018",
        title: "First Meeting",
        description:
          "We met at a coffee shop in downtown. It was love at first sight, though neither of us wanted to admit it. The way she smiled when she talked about her dreams... I knew she was special.",
      },
      {
        date: "December 2019",
        title: "First Adventure",
        description:
          "Our first trip together to the mountains. We knew we were meant to explore the world side by side, hand in hand, creating memories that would bloom into our forever.",
      },
      {
        date: "2022",
        title: "The Proposal",
        description:
          "Under the stars at our favorite spot by the lake, James got down on one knee and asked the question that changed everything. Of course, I said yes!",
      },
    ],
    galleryImages: [
      "/templates/bloom/assets/wedding-celebration.jpg",
      "/templates/bloom/assets/wedding-details-1.jpg",
      "/templates/bloom/assets/wedding-bouquet.jpg",
      "/templates/bloom/assets/couple-portrait.jpg",
      "/templates/bloom/assets/wedding-hero.jpg",
    ],
    galleryVideos: [
      {
        id: "bloom-video-1",
        title: "Romantic Ceremony",
        thumbnail: "/templates/bloom/assets/wedding-celebration.jpg",
        duration: "2:45",
        category: "during",
      },
      {
        id: "bloom-video-2",
        title: "First Dance",
        thumbnail: "/templates/bloom/assets/wedding-details-1.jpg",
        duration: "1:30",
        category: "during",
      },
      {
        id: "bloom-video-3",
        title: "Bouquet Preparation",
        thumbnail: "/templates/bloom/assets/wedding-bouquet.jpg",
        duration: "1:15",
        category: "before",
      },
    ],
    gifts: [
      {
        id: "bloom-gift-1",
        name: "Luxury Bedding Set",
        description: "Silk bedding set for our romantic nights together",
        price: "₦500,000",
        image:
          "https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Bedroom",
      },
      {
        id: "bloom-gift-2",
        name: "Garden Furniture",
        description: "Outdoor furniture for our garden where we'll have morning coffee",
        price: "₦800,000",
        image:
          "https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Outdoor",
      },
      {
        id: "bloom-gift-3",
        name: "Coffee Machine",
        description: "Espresso machine for our morning coffee ritual together",
        price: "₦450,000",
        image:
          "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Kitchen",
      },
      {
        id: "bloom-gift-4",
        name: "Flower Garden Kit",
        description: "Complete flower garden kit for our backyard",
        price: "₦300,000",
        image:
          "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Garden",
      },
    ],
    guestMessages: [
      {
        id: "bloom-guest-1",
        name: "Jennifer Smith",
        message:
          "Sarah and James, you two are perfect for each other! Can't wait to dance the night away at your wedding. Love you both! 💃✨",
        timestamp: "1 week ago",
      },
      {
        id: "bloom-guest-2",
        name: "Emma Wilson",
        message:
          "Your love story is like a beautiful garden - it keeps growing more beautiful every day! So happy for you both! 🌹💕",
        timestamp: "5 days ago",
      },
    ],
    bankDetails: [
      {
        id: "bloom-bank-1",
        bankName: "Garden Bank",
        accountName: "Sarah & James Bloom Fund",
        accountNumber: "9876543210",
      },
    ],
  },
  elegance: {
    // Modern, minimalist couple
    brideName: "Tamunomiebaka",
    groomName: "Precious",
    weddingDate: "December 14, 2024",
    venue: "Modern Art Gallery, Lagos",
    welcomeMessage: "Join us as we celebrate our love story and begin our journey together as one.",
    storyContent:
      "From our first meeting to this special day, our journey has been filled with love, laughter, and countless beautiful memories. We're excited to share this moment with all of you. Our love is simple, pure, and built on a foundation of mutual respect and understanding.",
    storyMilestones: [
      {
        date: "January 2020",
        title: "First Meeting",
        description:
          "We met at a modern art exhibition in Lagos. Precious was explaining a piece to a friend, and I was captivated by her perspective on life and art.",
      },
      {
        date: "June 2021",
        title: "Moving In Together",
        description:
          "We decided to take the next step and create a home together. Our minimalist apartment became our sanctuary.",
      },
      {
        date: "March 2024",
        title: "The Proposal",
        description:
          "Precious proposed during a quiet evening at home, surrounded by our favorite art pieces. It was perfect in its simplicity.",
      },
    ],
    galleryImages: [
      "/templates/elegance/assets/gallery-preview.jpg",
      "/templates/elegance/assets/couple-story1.jpg",
      "/templates/elegance/assets/couple-story2.jpg",
      "/templates/elegance/assets/wedding-hero.jpg",
    ],
    galleryVideos: [
      {
        id: "elegance-video-1",
        title: "Minimalist Ceremony",
        thumbnail: "/templates/elegance/assets/gallery-preview.jpg",
        duration: "2:20",
        category: "during",
      },
      {
        id: "elegance-video-2",
        title: "Art Gallery Tour",
        thumbnail: "/templates/elegance/assets/couple-story1.jpg",
        duration: "1:45",
        category: "before",
      },
    ],
    gifts: [
      {
        id: "elegance-gift-1",
        name: "Modern Art Piece",
        description: "Contemporary artwork for our home - something that speaks to our souls",
        price: "₦750,000",
        image:
          "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Art & Decor",
      },
      {
        id: "elegance-gift-2",
        name: "Designer Furniture",
        description: "Minimalist furniture set for our living room",
        price: "₦1,500,000",
        image:
          "https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Furniture",
      },
      {
        id: "elegance-gift-3",
        name: "Smart Home System",
        description: "Complete smart home automation system",
        price: "₦2,000,000",
        image:
          "https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Technology",
      },
    ],
    guestMessages: [
      {
        id: "elegance-guest-1",
        name: "Robert Johnson",
        message:
          "From the moment I met you both, I knew you were meant to be together. Your wedding is going to be absolutely magical! Congratulations! 🎉",
        timestamp: "1 week ago",
      },
      {
        id: "elegance-guest-2",
        name: "Aisha Okafor",
        message:
          "Your love is so pure and beautiful. Wishing you both a lifetime of happiness and simplicity! ✨",
        timestamp: "3 days ago",
      },
    ],
    bankDetails: [
      {
        id: "elegance-bank-1",
        bankName: "Modern Bank",
        accountName: "Tamunomiebaka & Precious",
        accountNumber: "5555666677",
      },
    ],
  },
  luxe: {
    // Luxury, premium couple
    brideName: "Isabella",
    groomName: "Alexander",
    weddingDate: "October 15, 2024",
    venue: "The Ritz-Carlton, Napa Valley",
    welcomeMessage:
      "Celebrate With Us - Join us for an unforgettable celebration of love and luxury.",
    storyContent:
      "Our love story is one of elegance, passion, and timeless romance. From our first meeting to this momentous day, every step has been filled with luxury and love. We believe that love should be celebrated in the most beautiful way possible, surrounded by those who matter most.",
    storyMilestones: [
      {
        date: "September 2019",
        title: "First Meeting",
        description:
          "We met at a high-end charity gala in Monaco. Isabella was the most elegant woman in the room, and I knew I had to know her better.",
      },
      {
        date: "December 2021",
        title: "First Luxury Trip",
        description:
          "Our first trip together was to the Maldives. We stayed in an overwater villa and knew we were meant to explore the world's most beautiful places together.",
      },
      {
        date: "February 2024",
        title: "The Proposal",
        description:
          "I proposed on a private yacht in the Mediterranean, surrounded by the most beautiful sunset. It was the perfect moment for our perfect love.",
      },
    ],
    galleryImages: [
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    galleryVideos: [
      {
        id: "luxe-video-1",
        title: "Luxury Wedding Highlights",
        thumbnail:
          "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
        duration: "4:00",
        category: "during",
      },
      {
        id: "luxe-video-2",
        title: "Pre-Wedding Luxury Shoot",
        thumbnail:
          "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400",
        duration: "3:30",
        category: "before",
      },
      {
        id: "luxe-video-3",
        title: "Honeymoon Preview",
        thumbnail:
          "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600",
        duration: "2:45",
        category: "after",
      },
    ],
    gifts: [
      {
        id: "luxe-gift-1",
        name: "Luxury Watch Set",
        description: "Matching luxury watches for the couple - timepieces that will last forever",
        price: "₦2,500,000",
        image:
          "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Luxury Accessories",
      },
      {
        id: "luxe-gift-2",
        name: "Designer Home Decor",
        description: "High-end home decoration pieces from world-renowned designers",
        price: "₦3,000,000",
        image:
          "https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Home & Decor",
      },
      {
        id: "luxe-gift-3",
        name: "Luxury Car Accessories",
        description: "Premium car accessories and upgrades for our luxury vehicles",
        price: "₦5,000,000",
        image:
          "https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Automotive",
      },
      {
        id: "luxe-gift-4",
        name: "Private Jet Experience",
        description: "Private jet charter for our honeymoon getaway",
        price: "₦15,000,000",
        image:
          "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "Travel",
      },
    ],
    guestMessages: [
      {
        id: "luxe-guest-1",
        name: "Victoria Sterling",
        message:
          "What an absolutely stunning couple! Your wedding will be the event of the year. Wishing you both a lifetime of luxury and love! ✨💎",
        timestamp: "3 days ago",
      },
      {
        id: "luxe-guest-2",
        name: "Alexander Gold",
        message:
          "Congratulations on your beautiful union! May your marriage be filled with all the luxury and happiness you deserve. Cheers to forever! 🥂",
        timestamp: "5 days ago",
      },
      {
        id: "luxe-guest-3",
        name: "Diana Platinum",
        message:
          "Your love story is truly inspiring! Can't wait to celebrate this magnificent occasion with you both. Here's to a lifetime of elegance and joy! 💫",
        timestamp: "1 week ago",
      },
    ],
    bankDetails: [
      {
        id: "luxe-bank-1",
        bankName: "Luxury Private Bank",
        accountName: "Isabella & Alexander Luxury Fund",
        accountNumber: "9999888877",
      },
    ],
  },
};

async function main() {
  console.log("🌱 Starting comprehensive template seeding...");

  try {
    // Create templates
    for (const [templateKey, templateData] of Object.entries(TEMPLATES)) {
      console.log(`\n📝 Creating template: ${templateData.name}`);

      // Create or update template
      const template = await prisma.template.upsert({
        where: { name: templateData.name },
        update: {
          description: templateData.description,
          thumbnail: templateData.thumbnail,
          hero_image: templateData.heroImage,
          colorSchemes: templateData.colorSchemes,
          previewData: {},
          isActive: true,
        },
        create: {
          name: templateData.name,
          description: templateData.description,
          thumbnail: templateData.thumbnail,
          hero_image: templateData.heroImage,
          categoryId: templateData.categoryId,
          layout_data: {},
          components: {},
          colorSchemes: templateData.colorSchemes,
          previewData: {},
          isActive: true,
        },
      });

      console.log(`✅ Template ${templateData.name} created/updated (ID: ${template.id})`);

      // Create template sections
      await createTemplateSections(template.id, templateKey);

      // Create preview data
      await createPreviewData(template.id, templateData, templateKey);

      // Link to plans
      await linkTemplateToPlans(template.id, templateData.planIds);

      console.log(`🎉 Template ${templateData.name} fully seeded!`);
    }

    console.log("\n🎊 All templates successfully seeded!");
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    throw error;
  }
}

async function createTemplateSections(templateId: string, templateKey: string) {
  console.log(`  📋 Creating sections for ${templateKey}...`);

  // Get template-specific sample data
  const sampleData = TEMPLATE_SAMPLE_DATA[templateKey as keyof typeof TEMPLATE_SAMPLE_DATA];

  // Delete existing sections first
  await prisma.templateSection.deleteMany({
    where: { templateId },
  });

  const sections = [
    {
      type: "HERO" as const,
      layout: `${templateKey}_hero`,
      order: 1,
      components: {
        title: "{groomName} & {brideName}",
        subtitle: "{weddingDate}",
        venue: "{venue}",
        description: "{welcomeMessage}",
        heroImage: TEMPLATES[templateKey as keyof typeof TEMPLATES].heroImage,
        // Template-specific styling
        style: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.hero.style,
        layout_type: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.hero.layout,
        elements: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.hero.elements,
      },
    },
    {
      type: "STORY" as const,
      layout: `${templateKey}_story`,
      order: 2,
      components: {
        title: "Our Story",
        content: "{storyContent}",
        storyImage1: TEMPLATES[templateKey as keyof typeof TEMPLATES].assets[1] || null,
        storyImage2: TEMPLATES[templateKey as keyof typeof TEMPLATES].assets[2] || null,
        milestones: sampleData.storyMilestones || [],
        // Template-specific styling
        style: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.story.style,
        layout_type: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.story.layout,
        elements: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.story.elements,
      },
    },
    {
      type: "GALLERY" as const,
      layout: `${templateKey}_gallery`,
      order: 3,
      components: {
        title: "Gallery",
        description: "Capturing the beautiful moments of our journey together",
        // Create gallery array with proper structure for components
        gallery: [
          // Add images
          ...sampleData.galleryImages.map((image, index) => ({
            id: `${templateKey}-image-${index}`,
            url: image,
            type: "PHOTO" as const,
            category: "during" as const,
            createdAt: new Date().toISOString(),
          })),
          // Add videos
          ...sampleData.galleryVideos.map((video, index) => ({
            id: video.id || `${templateKey}-video-${index}`,
            url: video.thumbnail || "",
            type: "VIDEO" as const,
            category: video.category || ("during" as const),
            createdAt: new Date().toISOString(),
          })),
        ],
        // Keep separate arrays for backward compatibility
        images: sampleData.galleryImages,
        videos: sampleData.galleryVideos,
        categories: ["all", "before", "during", "after"],
        // Template-specific styling
        style: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.gallery.style,
        layout_type: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.gallery.layout,
        elements: TEMPLATES[templateKey as keyof typeof TEMPLATES].components.gallery.elements,
      },
    },
    {
      type: "REGISTRY" as const,
      layout: `${templateKey}_gift`,
      order: 4,
      components: {
        title: "Gift Registry",
        description: "Your presence at our wedding is the greatest gift of all",
        gifts: sampleData.gifts,
        cashGiftEnabled: true,
        bankDetails: sampleData.bankDetails || [],
      },
    },
    {
      type: "WISHES" as const,
      layout: `${templateKey}_guest`,
      order: 5,
      components: {
        title: "Well Wishes",
        description: "Share your love, memories, and well wishes for our special day",
        existingMessages: sampleData.guestMessages,
        allowNewMessages: true,
      },
    },
  ];

  for (const section of sections) {
    await prisma.templateSection.create({
      data: {
        templateId,
        type: section.type,
        layout: section.layout,
        components: section.components,
        order: section.order,
      },
    });
  }

  console.log(`  ✅ Created ${sections.length} sections for ${templateKey}`);
}

async function createPreviewData(templateId: string, templateData: any, templateKey: string) {
  console.log(`  🖼️ Creating preview data for ${templateData.name}...`);

  // Get template-specific sample data
  const sampleData = TEMPLATE_SAMPLE_DATA[templateKey as keyof typeof TEMPLATE_SAMPLE_DATA];

  const previewData = {
    // Basic template info
    templateId,
    templateName: templateData.name,
    category: templateData.categoryId,

    // Template-specific couple data
    brideName: sampleData.brideName,
    groomName: sampleData.groomName,
    weddingDate: sampleData.weddingDate,
    venue: sampleData.venue,
    welcomeMessage: sampleData.welcomeMessage,

    // Images
    heroImage: templateData.heroImage,
    storyImage: templateData.assets[1] || null,

    // Gallery with both images and videos
    gallery: [
      // Add images
      ...sampleData.galleryImages.map((image, index) => ({
        id: `${templateKey}-image-${index}`,
        url: image,
        type: "PHOTO" as const,
        category: "during" as const,
        createdAt: new Date().toISOString(),
      })),
      // Add videos
      ...sampleData.galleryVideos.map((video, index) => ({
        id: video.id || `${templateKey}-video-${index}`,
        url: video.thumbnail || "",
        type: "VIDEO" as const,
        category: video.category || ("during" as const),
        createdAt: new Date().toISOString(),
      })),
    ],

    // Template-specific gifts
    gifts: sampleData.gifts,

    // Template-specific guest messages
    guests: sampleData.guestMessages,

    // Template-specific bank details
    bankDetails: sampleData.bankDetails || [
      {
        id: "preview-bank-1",
        bankName: "Sample Bank",
        accountName: `${sampleData.brideName} & ${sampleData.groomName}`,
        accountNumber: "1234567890",
      },
    ],

    // All template assets
    assets: templateData.assets,

    // Color schemes
    colorSchemes: templateData.colorSchemes,

    // Template-specific story content
    storyContent: sampleData.storyContent,
    storyMilestones: sampleData.storyMilestones || [],

    // Template-specific layout and styling
    layout_data: templateData.layout_data,
    components: templateData.components,

    // Template-specific styling info
    fontFamily: templateData.layout_data.fontFamily,
    layout: templateData.layout_data.layout,
    spacing: templateData.layout_data.spacing,
    animations: templateData.layout_data.animations,
  };

  await prisma.template.update({
    where: { id: templateId },
    data: { previewData },
  });

  console.log(`  ✅ Preview data created for ${templateData.name}`);
}

async function linkTemplateToPlans(templateId: string, planIds: string[]) {
  console.log(`  🔗 Linking template to ${planIds.length} plans...`);

  // Map plan IDs to readable names for logging
  const planNames = {
    [PLANS.DELIGHT]: "Delight",
    [PLANS.DARLING]: "Darling",
    [PLANS.DAZZLE]: "Dazzle",
    [PLANS.DYNASTY_ROYALE]: "Dynasty Royale",
  };

  for (const planId of planIds) {
    await prisma.planTemplate.upsert({
      where: {
        planId_templateId: {
          planId,
          templateId,
        },
      },
      update: {},
      create: {
        planId,
        templateId,
      },
    });
  }

  const readablePlanNames = planIds.map((id) => planNames[id as keyof typeof planNames]).join(", ");
  console.log(`  ✅ Template linked to plans: ${readablePlanNames}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
