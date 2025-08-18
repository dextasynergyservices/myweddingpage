import { templateRegistry } from "@/lib/template-registry";
import { componentMap } from "@/lib/template-registry";

interface PageProps {
  params: { couple: string };
  searchParams: { template?: keyof typeof templateRegistry };
}

export default function WeddingPage({ params, searchParams }: PageProps) {
  // Dynamic template selection
  const templateName = searchParams.template || "luxury";
  const template = templateRegistry[templateName];

  // Dynamic data handling
  const userData = {
    brideName: "Emily",
    groomName: "James",
    weddingDate: "June 15, 2025",
    venue: "Grand Ballroom"
  };

  return (
    <div className="min-h-screen bg-white">
      {template.components.map((component, index) => {
        const Component = componentMap[component.type];

        // Placeholder replacement
        const processedContent = Object.fromEntries(
          Object.entries(component.content).map(([key, value]) => [
            key,
            typeof value === 'string'
              ? value
                  .replace(/{brideName}/g, userData.brideName)
                  .replace(/{groomName}/g, userData.groomName)
                  .replace(/{weddingDate}/g, userData.weddingDate)
                  .replace(/{venue}/g, userData.venue)
              : value
          ])
        );

        return <Component key={index} {...processedContent} />;
      })}
    </div>
  );
}