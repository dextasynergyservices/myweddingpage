export const luxuryTemplate = {
  name: "Luxury Affair",
  category: "luxury",
  thumbnail: "/templates/luxury.jpg",
  requiredPlan: "DYNASTY_ROYALE",
  components: [
    {
      type: "luxury_hero",
      content: {
        title: "{brideName} & {groomName}",
        subtitle: "{weddingDate} | Exclusive Resort",
      },
    },
    {
      type: "luxury_timeline",
      content: {
        events: [
          { time: "4:00 PM", name: "Ceremony" },
          { time: "6:00 PM", name: "Reception" },
        ],
      },
    },
  ],
};
