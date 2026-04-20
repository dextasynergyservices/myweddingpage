export const eleganceTemplate = {
  name: "Elegance",
  category: "Minimalist",
  thumbnail: "/thumbnail/elegance_thumbnail.png",
  requiredPlan: "DARLING",
  components: [
    {
      type: "elegance_hero",
      content: {
        title: "{brideName} & {groomName}",
        subtitle: "{weddingDate}",
        venue: "{venue}",
        // description: "{welcomeMessage}",
      },
    },
    {
      type: "elegance_story",
      content: {
        title: "Our Story",
        content: "{storyContent}",
        milestones: [],
      },
    },
    {
      type: "elegance_gallery",
      content: {
        title: "Gallery",
        description: "Capturing the beautiful moments of our journey together",
        images: [],
        videos: [],
      },
    },
    {
      type: "elegance_gift",
      content: {
        title: "Gift Registry",
        description: "Your presence at our wedding is the greatest gift of all",
        gifts: [],
      },
    },
    {
      type: "elegance_guest",
      content: {
        title: "Well Wishes",
        description:
          "Share your love, memories, and well wishes for our special day",
        existingMessages: [],
      },
    },
  ],
};
