export const vowsTemplate = {
  name: "Vows",
  category: "Classic",
  thumbnail: "/thumbnail/vows_thumbnail.png",
  requiredPlan: "DELIGHT",
  components: [
    {
      type: "vows_hero",
      content: {
        title: "{brideName} & {groomName}",
        subtitle: "{weddingDate}",
        venue: "{venue}",
        // description: "{welcomeMessage}",
      },
    },
    {
      type: "vows_story",
      content: {
        title: "Our Story",
        content: "{storyContent}",
        milestones: [],
      },
    },
    {
      type: "vows_gallery",
      content: {
        title: "Gallery",
        description: "Capturing the beautiful moments of our journey together",
        images: [],
        videos: [],
      },
    },
    {
      type: "vows_gift",
      content: {
        title: "Gift Registry",
        description: "Your presence at our wedding is the greatest gift of all",
        gifts: [],
      },
    },
    {
      type: "vows_guest",
      content: {
        title: "Well Wishes",
        description: "Share your love, memories, and well wishes for our special day",
        existingMessages: [],
      },
    },
  ],
};
