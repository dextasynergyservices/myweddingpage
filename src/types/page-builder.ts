import { ComponentType } from "@/lib/template-registry";

export type DroppedComponent = {
  id: string;
  type: ComponentType;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  styles?: Record<string, string>;
  position: number;
};
