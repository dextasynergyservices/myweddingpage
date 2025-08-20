export const PLANS = {
    DELIGHT: {
      name: "Delight",
      maxPhotos: 20,
      maxComponents: 3,
      allowedTemplates: ['rustic']
    },
    DARLING: {
      name: "Darling",
      maxPhotos: 50,
      maxComponents: 5,
      allowedTemplates: ['rustic', 'modern']
    },
    DAZZLE: {
      name: "Dazzle",
      maxPhotos: 100,
      maxComponents: 7,
      allowedTemplates: ['rustic', 'modern', 'vintage']
    },
    DYNASTY_ROYALE: {
      name: "Dynasty Royale",
      maxPhotos: 200,
      maxComponents: 10,
      allowedTemplates: ['rustic', 'modern', 'vintage', 'luxury']
    }
  } as const;