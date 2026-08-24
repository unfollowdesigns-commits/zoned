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
  Factory,
  ScanSearch,
  MapPinned,
  ChartColumn,
  MonitorDot,
  Layers,
  Radar,
  MessageCircleHeart,
  Radio,
} from "lucide-react";

export type IconComponent = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

/**
 * Resolves the string keys used in lib/site.ts to icon components.
 *
 * EVERY ICON THE SITE DRAWS GOES THROUGH HERE, and that is a constraint rather
 * than a convenience. Icons are animated by ui/DrawIcon, which is a client
 * component, and a server component cannot hand a client component a function:
 * `icon={ScanSearch}` throws at the boundary. A string key crosses it fine. So
 * pages name an icon and this table is the one place that knows what that name
 * means, which also means the whole set can be swapped without touching a page.
 */
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
  factory: Factory,
  /* The DP Difference stack. */
  scan: ScanSearch,
  mapped: MapPinned,
  chart: ChartColumn,
  monitor: MonitorDot,
  layers: Layers,
  radar: Radar,
  care: MessageCircleHeart,
  radio: Radio,
};
