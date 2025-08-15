export const RusticTemplate = {
    name: "Rustic ",
    category: "classic",
    thumbnail: "/templates/classic.jpg",
    requiredPlan: "DELIGHT",
    components: [
      {
        type: "rustic_hero",
        content: {
          title: "{brideName} & {groomName}",
          date: "{weddingDate}",
          venue: "Grand Ballroom"
        }
      },
      {
        type: "rustic_story",
        content: {
          title: "Our Story",
          text: "From our first meeting to this special day..."
        }
      }
    ]
  };