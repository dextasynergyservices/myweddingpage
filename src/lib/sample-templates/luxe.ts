export const luxeTemplate = {
  name: "Luxe",
  category: "Modern",
  thumbnail: "/thumbnail/luxe_thumbnail.png",
  requiredPlan: "DYNASTY_ROYALE",
  components: [
    {
      type: "luxe_hero",
      content: {
        title: "{brideName} & {groomName}",
        subtitle: "{weddingDate}",
        venue: "{venue}",
        // description: "{welcomeMessage}",
      },
    },
    {
      type: "luxe_story",
      content: {
        title: "Our Story",
        content: "{storyContent}",
        milestones: [],
      },
    },
    {
      type: "luxe_gallery",
      content: {
        title: "Gallery",
        description: "Capturing the beautiful moments of our journey together",
        images: [],
        videos: [],
      },
    },
    {
      type: "luxe_gift",
      content: {
        title: "Gift Registry",
        description: "Your presence at our wedding is the greatest gift of all",
        gifts: [],
      },
    },
    {
      type: "luxe_guest",
      content: {
        title: "Well Wishes",
        description:
          "Share your love, memories, and well wishes for our special day",
        existingMessages: [],
      },
    },
  ],
};
