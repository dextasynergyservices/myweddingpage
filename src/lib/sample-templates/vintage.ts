export const vintageTemplate = {
  name: "Vintage Romance",
  category: "vintage",
  thumbnail: "/templates/vintage.jpg",
  requiredPlan: "DAZZLE",
  components: [
    {
      type: "vintage_hero",
      content: {
        title: "{brideName} & {groomName}",
        date: "{weddingDate}",
        location: "Garden Venue",
      },
    },
    {
      type: "vintage_gallery",
      content: {
        images: ["/vintage1.jpg", "/vintage2.jpg"],
      },
    },
  ],
};
