import { OurStorySection as VowsStory } from "@/app/templates/vows/VowsStory";
import { default as BloomStory } from "@/app/templates/bloom/BloomStory";
import { default as EleganceStory } from "@/app/templates/elegance/EleganceStory";
import { default as LuxeStory } from "@/app/templates/luxe/LuxeStory";

// Story component interfaceset
export interface VowsStoryProps {
  title?: string;
  description?: string;
  storyContent?: {
    howWeMet?: {
      title?: string;
      content?: string;
    };
    theProposal?: {
      title?: string;
      content?: string;
    };
  };
  storyImages?: {
    image1?: string;
    image2?: string;
  };
  storyImage?: string;
  ourStory?: {
    content?: string;
    imageUrl?: string;
  };
}

export interface BloomStoryProps {
  title?: string;
  description?: string;
  storyContent?: {
    mainTitle?: string;
    mainDescription?: string;
    storyText?: string;
  };
  milestones?: Array<{
    date: string;
    title: string;
    description: string;
    icon: string;
  }>;
  storyImage?: string;
  ourStory?: {
    content?: string;
    imageUrl?: string;
  };
}

export interface EleganceStoryProps {
  title?: string;
  description?: string;
  stories?: Array<{
    title: string;
    date: string;
    story: string;
    image: string;
  }>;
  storyImage?: string;
  ourStory?: {
    content?: string;
    imageUrl?: string;
  };
}

export interface LuxeStoryProps {
  title?: string;
  description?: string;
  storyItems?: Array<{
    title: string;
    text: string;
    image: string;
  }>;
  storyImage?: string;
  ourStory?: {
    content?: string;
    imageUrl?: string;
  };
}

// Template ID to story component mapping
// This will be populated dynamically with actual template IDs from the database
export const storyComponentMap: Record<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any;
    formFields: Array<{
      key: string;
      label: string;
      type: string;
      defaultValue: string;
    }>;
  }
> = {};

// Story component configurations by template type
const storyConfigs = {
  vows: {
    component: VowsStory,
    props: {} as VowsStoryProps,
    formFields: [
      {
        key: "title",
        label: "Story Title",
        type: "text",
        defaultValue: "Our Story",
      },
      {
        key: "description",
        label: "Story Description",
        type: "textarea",
        defaultValue:
          "Every love story is beautiful, but ours is our favorite. From our first meeting to this magical moment, here's how our journey began.",
      },
      {
        key: "storyContent.howWeMet.title",
        label: "How We Met - Title",
        type: "text",
        defaultValue: "How We Met",
      },
      {
        key: "storyContent.howWeMet.content",
        label: "How We Met - Story",
        type: "textarea",
        defaultValue:
          "It was a beautiful spring afternoon at the local coffee shop...",
      },
      {
        key: "storyContent.theProposal.title",
        label: "The Proposal - Title",
        type: "text",
        defaultValue: "The Proposal",
      },
      {
        key: "storyContent.theProposal.content",
        label: "The Proposal - Story",
        type: "textarea",
        defaultValue:
          "On a snowy December evening, Michael took Sarah back to that same coffee shop...",
      },
      {
        key: "storyImages.image1",
        label: "Story Image 1",
        type: "file",
        defaultValue:
          "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      {
        key: "storyImages.image2",
        label: "Story Image 2",
        type: "file",
        defaultValue:
          "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ],
  },
  bloom: {
    component: BloomStory,
    props: {} as BloomStoryProps,
    formFields: [
      {
        key: "title",
        label: "Story Title",
        type: "text",
        defaultValue: "Our Love Story",
      },
      {
        key: "description",
        label: "Story Description",
        type: "textarea",
        defaultValue:
          "Every love story is beautiful, but ours is our favorite. Here's how two hearts found their way to each other and decided to walk together forever.",
      },
      {
        key: "storyContent.mainTitle",
        label: "Main Story Title",
        type: "text",
        defaultValue: "A Love That Bloomed",
      },
      {
        key: "storyContent.mainDescription",
        label: "Main Story Description",
        type: "textarea",
        defaultValue:
          "What started as a chance encounter at our favorite coffee shop...",
      },
      {
        key: "storyContent.storyText",
        label: "Additional Story Text",
        type: "textarea",
        defaultValue:
          "From quiet Sunday mornings to adventurous weekend getaways...",
      },
      {
        key: "storyImage",
        label: "Story Image",
        type: "file",
        defaultValue: "/templates/bloom/assets/couple-portrait.jpg",
      },
      {
        key: "milestones.0.date",
        label: "Milestone 1 - Date",
        type: "text",
        defaultValue: "March 2018",
      },
      {
        key: "milestones.0.title",
        label: "Milestone 1 - Title",
        type: "text",
        defaultValue: "First Meeting",
      },
      {
        key: "milestones.0.description",
        label: "Milestone 1 - Description",
        type: "textarea",
        defaultValue:
          "We met at a coffee shop in downtown. It was love at first sight, though neither of us wanted to admit it.",
      },
      {
        key: "milestones.1.date",
        label: "Milestone 2 - Date",
        type: "text",
        defaultValue: "December 2019",
      },
      {
        key: "milestones.1.title",
        label: "Milestone 2 - Title",
        type: "text",
        defaultValue: "First Adventure",
      },
      {
        key: "milestones.1.description",
        label: "Milestone 2 - Description",
        type: "textarea",
        defaultValue:
          "Our first trip together to the mountains. We knew we were meant to explore the world side by side.",
      },
      {
        key: "milestones.2.date",
        label: "Milestone 3 - Date",
        type: "text",
        defaultValue: "2022",
      },
      {
        key: "milestones.2.title",
        label: "Milestone 3 - Title",
        type: "text",
        defaultValue: "The Proposal",
      },
      {
        key: "milestones.2.description",
        label: "Milestone 3 - Description",
        type: "textarea",
        defaultValue:
          "Under the stars at our favorite spot by the lake, James got down on one knee and asked the question that changed everything.",
      },
      {
        key: "milestones.3.date",
        label: "Milestone 4 - Date",
        type: "text",
        defaultValue: "June 2024",
      },
      {
        key: "milestones.3.title",
        label: "Milestone 4 - Title",
        type: "text",
        defaultValue: "Our Wedding",
      },
      {
        key: "milestones.3.description",
        label: "Milestone 4 - Description",
        type: "textarea",
        defaultValue:
          'Today, we say "I do" and begin our greatest adventure yet - a lifetime of love together.',
      },
    ],
  },
  elegance: {
    component: EleganceStory,
    props: {} as EleganceStoryProps,
    formFields: [
      {
        key: "title",
        label: "Story Title",
        type: "text",
        defaultValue: "Our Love Story",
      },
      {
        key: "description",
        label: "Story Description",
        type: "textarea",
        defaultValue:
          "Every love story is beautiful, but ours is our favorite. Here's how it all began...",
      },
      {
        key: "stories.0.title",
        label: "Story 1 - Title",
        type: "text",
        defaultValue: "How We Met",
      },
      {
        key: "stories.0.date",
        label: "Story 1 - Date",
        type: "text",
        defaultValue: "September 2019",
      },
      {
        key: "stories.0.story",
        label: "Story 1 - Content",
        type: "textarea",
        defaultValue:
          "It was a beautiful autumn day when our paths first crossed...",
      },
      {
        key: "stories.0.image",
        label: "Story 1 - Image",
        type: "file",
        defaultValue:
          "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      {
        key: "stories.1.title",
        label: "Story 2 - Title",
        type: "text",
        defaultValue: "The Proposal",
      },
      {
        key: "stories.1.date",
        label: "Story 2 - Date",
        type: "text",
        defaultValue: "December 2023",
      },
      {
        key: "stories.1.story",
        label: "Story 2 - Content",
        type: "textarea",
        defaultValue:
          "On a snowy winter evening, James recreated our first date...",
      },
      {
        key: "stories.1.image",
        label: "Story 2 - Image",
        type: "file",
        defaultValue:
          "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ],
  },
  luxe: {
    component: LuxeStory,
    props: {} as LuxeStoryProps,
    formFields: [
      {
        key: "title",
        label: "Story Title",
        type: "text",
        defaultValue: "Our Love Story",
      },
      {
        key: "description",
        label: "Story Description",
        type: "textarea",
        defaultValue: "Every love story is beautiful, but ours is our favorite",
      },
      {
        key: "storyItems.0.title",
        label: "Story 1 - Title",
        type: "text",
        defaultValue: "How We Met",
      },
      {
        key: "storyItems.0.text",
        label: "Story 1 - Text",
        type: "textarea",
        defaultValue: "It was a rainy Tuesday at the local coffee shop...",
      },
      {
        key: "storyItems.0.image",
        label: "Story 1 - Image",
        type: "file",
        defaultValue:
          "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      {
        key: "storyItems.1.title",
        label: "Story 2 - Title",
        type: "text",
        defaultValue: "First Date",
      },
      {
        key: "storyItems.1.text",
        label: "Story 2 - Text",
        type: "textarea",
        defaultValue:
          "Our first official date was at the art museum downtown...",
      },
      {
        key: "storyItems.1.image",
        label: "Story 2 - Image",
        type: "file",
        defaultValue:
          "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      {
        key: "storyItems.2.title",
        label: "Story 3 - Title",
        type: "text",
        defaultValue: "The Proposal",
      },
      {
        key: "storyItems.2.text",
        label: "Story 3 - Text",
        type: "textarea",
        defaultValue:
          "Michael proposed during a weekend getaway to the mountains...",
      },
      {
        key: "storyItems.2.image",
        label: "Story 3 - Image",
        type: "file",
        defaultValue:
          "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ],
  },
};

// Cache for template IDs and their configurations
const templateIdCache: Record<string, Record<string, unknown>> = {};
let isInitialized = false;

// Function to initialize template IDs from database
async function initializeTemplateIds() {
  if (isInitialized) return;

  try {
    const response = await fetch("/api/templates/get-id");
    if (response.ok) {
      const data = await response.json();

      // Map template names to their IDs and story configurations
      for (const template of data.templates) {
        const templateName = template.name.toLowerCase();
        let configKey = "";

        // Determine which story configuration to use based on template name
        if (templateName.includes("vows")) {
          configKey = "vows";
        } else if (templateName.includes("bloom")) {
          configKey = "bloom";
        } else if (templateName.includes("elegance")) {
          configKey = "elegance";
        } else if (templateName.includes("luxe")) {
          configKey = "luxe";
        } else {
          // Default to vows for unknown templates
          configKey = "vows";
        }

        // Map the template ID to its story configuration
        storyComponentMap[template.id] =
          storyConfigs[configKey as keyof typeof storyConfigs];
        templateIdCache[template.id] = template.name;
      }

      isInitialized = true;
      console.log("Template IDs initialized:", Object.keys(storyComponentMap));
    }
  } catch (error) {
    console.error("Error initializing template IDs:", error);
  }
}

// Helper function to get story component for a template by ID
export async function getStoryComponent(templateId: string) {
  console.log("getStoryComponent - Looking for templateId:", templateId);

  // Initialize template IDs if not done yet
  await initializeTemplateIds();

  const result = storyComponentMap[templateId];

  if (!result) {
    console.log(
      "Template ID not found in registry. Available template IDs:",
      Object.keys(storyComponentMap)
    );
    console.log("Please ensure the template ID exists in the database.");
  }

  console.log("getStoryComponent - Result:", result);
  return result || null;
}

// Helper function to get form fields for a template
export async function getStoryFormFields(templateId: string) {
  const storyConfig = await getStoryComponent(templateId);
  return storyConfig?.formFields || [];
}

// Helper function to create initial form data for a template
export async function createInitialStoryData(
  templateId: string,
  existingData?: Record<string, unknown>
) {
  const storyConfig = await getStoryComponent(templateId);
  if (!storyConfig) return {};

  const initialData: Record<string, unknown> = {};

  storyConfig.formFields.forEach((field) => {
    const keys = field.key.split(".");
    let current = initialData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current = current[keys[i]] as any;
    }

    // Use existing data if available, otherwise use default value
    const existingValue = existingData
      ? getNestedValue(existingData, field.key)
      : undefined;
    current[keys[keys.length - 1]] = existingValue || field.defaultValue;
  });

  // Special handling for Elegance template - convert stories object to array
  if (
    initialData.stories &&
    typeof initialData.stories === "object" &&
    !Array.isArray(initialData.stories)
  ) {
    const storiesArray = [];
    let index = 0;

    // Convert stories.0, stories.1, etc. to an array
    while ((initialData.stories as Record<string, unknown>)[index]) {
      storiesArray.push(
        (initialData.stories as Record<string, unknown>)[index]
      );
      index++;
    }

    initialData.stories = storiesArray;
  }

  // Special handling for Luxe template - convert storyItems object to array
  if (
    initialData.storyItems &&
    typeof initialData.storyItems === "object" &&
    !Array.isArray(initialData.storyItems)
  ) {
    const storyItemsArray = [];
    let index = 0;

    // Convert storyItems.0, storyItems.1, etc. to an array
    while ((initialData.storyItems as Record<string, unknown>)[index]) {
      storyItemsArray.push(
        (initialData.storyItems as Record<string, unknown>)[index]
      );
      index++;
    }

    initialData.storyItems = storyItemsArray;
  }

  // Special handling for Bloom template - convert milestones object to array
  if (
    initialData.milestones &&
    typeof initialData.milestones === "object" &&
    !Array.isArray(initialData.milestones)
  ) {
    const milestonesArray = [];
    let index = 0;

    // Convert milestones.0, milestones.1, etc. to an array
    while ((initialData.milestones as Record<string, unknown>)[index]) {
      milestonesArray.push(
        (initialData.milestones as Record<string, unknown>)[index]
      );
      index++;
    }

    initialData.milestones = milestonesArray;
  }

  return initialData;
}

// Helper function to get nested value from object
function getNestedValue(obj: Record<string, unknown>, path: string) {
  return path
    .split(".")
    .reduce(
      (current: unknown, key) => (current as Record<string, unknown>)?.[key],
      obj
    );
}

// Helper function to set nested value in object
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current = current[keys[i]] as any;
  }

  current[keys[keys.length - 1]] = value;
  return obj;
}

// Helper function to convert form data back to the structure expected by components
export function convertFormDataForComponent(formData: Record<string, unknown>) {
  const convertedData = { ...formData };

  // Convert stories array back to object structure for form storage
  if (convertedData.stories && Array.isArray(convertedData.stories)) {
    const storiesObj: Record<string, unknown> = {};
    convertedData.stories.forEach(
      (story: Record<string, unknown>, index: number) => {
        storiesObj[index] = story;
      }
    );
    convertedData.stories = storiesObj;
  }

  // Convert storyItems array back to object structure for form storage
  if (convertedData.storyItems && Array.isArray(convertedData.storyItems)) {
    const storyItemsObj: Record<string, unknown> = {};
    convertedData.storyItems.forEach(
      (item: Record<string, unknown>, index: number) => {
        storyItemsObj[index] = item;
      }
    );
    convertedData.storyItems = storyItemsObj;
  }

  // Convert milestones array back to object structure for form storage
  if (convertedData.milestones && Array.isArray(convertedData.milestones)) {
    const milestonesObj: Record<string, unknown> = {};
    convertedData.milestones.forEach(
      (milestone: Record<string, unknown>, index: number) => {
        milestonesObj[index] = milestone;
      }
    );
    convertedData.milestones = milestonesObj;
  }

  return convertedData;
}
