import {
  Search,
  Briefcase,
  Timer,
  Brackets,
  Presentation,
  Calculator,
  Laptop,
  Binoculars,
  TrendingUp,
  Coins,
  BrainCircuit,
  Building2,
  Landmark,
  HeartPulse,
  Newspaper,
  GitBranch,
  Accessibility,
  Paperclip,
  MessagesSquare,
} from "lucide-react";

export type IconComponent = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

/** Resolves the string keys used in lib/site.ts to icon components. */
export const ICONS: Record<string, IconComponent> = {
  search: Search,
  briefcase: Briefcase,
  timer: Timer,
  brackets: Brackets,
  presentation: Presentation,
  calculator: Calculator,
  laptop: Laptop,
  binoculars: Binoculars,
  trending: TrendingUp,
  coins: Coins,
  brain: BrainCircuit,
  building: Building2,
  landmark: Landmark,
  health: HeartPulse,
  news: Newspaper,
  branch: GitBranch,
  accessibility: Accessibility,
  paperclip: Paperclip,
  messages: MessagesSquare,
};
