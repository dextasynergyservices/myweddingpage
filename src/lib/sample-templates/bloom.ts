export const bloomTemplate = {
  name: "Bloom",
  category: "Luxury",
  thumbnail: "/thumbnail/bloom_thumbnail.png",
  requiredPlan: "DELIGHT",
  components: [
    {
      type: "bloom_hero",
      content: {
        title: "{brideName} & {groomName}",
        subtitle: "{weddingDate}",
        venue: "{venue}",
        // description: "{welcomeMessage}",
      },
    },
    {
      type: "bloom_story",
      content: {
        title: "Our Story",
        content: "{storyContent}",
        milestones: [],
      },
    },
    {
      type: "bloom_gallery",
      content: {
        title: "Gallery",
        description: "Capturing the beautiful moments of our journey together",
        images: [],
        videos: [],
      },
    },
    {
      type: "bloom_gift",
      content: {
        title: "Gift Registry",
        description: "Your presence at our wedding is the greatest gift of all",
        gifts: [],
      },
    },
    {
      type: "bloom_guest",
      content: {
        title: "Well Wishes",
        description: "Share your love, memories, and well wishes for our special day",
        existingMessages: [],
      },
    },
  ],
};
