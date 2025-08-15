export const PLANS = {
    DELIGHT: {
      name: "Delight",
      maxPhotos: 20,
      maxComponents: 3,
      allowedTemplates: ['classic']
    },
    DARLING: {
      name: "Darling",
      maxPhotos: 50,
      maxComponents: 5,
      allowedTemplates: ['classic', 'modern']
    },
    DAZZLE: {
      name: "Dazzle",
      maxPhotos: 100,
      maxComponents: 7,
      allowedTemplates: ['classic', 'modern', 'vintage']
    },
    DYNASTY_ROYALE: {
      name: "Dynasty Royale",
      maxPhotos: 200,
      maxComponents: 10,
      allowedTemplates: ['classic', 'modern', 'vintage', 'luxury']
    }
  } as const;