export const modernTemplate = {
    name: "Modern Minimal",
    category: "modern",
    thumbnail: "/templates/modern.jpg",
    requiredPlan: "DARLING",
    components: [
      {
        type: "modern_hero",
        content: {
          coupleNames: "{brideName} & {groomName}",
          weddingDate: "{weddingDate}",
          location: "City Venue"
        }
      },
      {
        type: "modern_gallery",
        content: {
          images: ["/default1.jpg", "/default2.jpg"]
        }
      }
    ]
  };