import {
  Megaphone, Monitor, CalendarCheck, Bot, Palette, Sparkles, Handshake, BarChart3, Trophy, Layers,
  ShieldCheck, Target, Zap, Globe, Users, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  megaphone: Megaphone, monitor: Monitor, calendar: CalendarCheck, bot: Bot, palette: Palette,
  sparkles: Sparkles, handshake: Handshake, chart: BarChart3, trophy: Trophy, layers: Layers,
  shield: ShieldCheck, target: Target, zap: Zap, globe: Globe, users: Users,
};

export const ICON_NAMES = Object.keys(MAP);

export function Icon({ name, className }: { name?: string | null; className?: string }) {
  const C = (name && MAP[name]) || Sparkles;
  return <C className={className} aria-hidden="true" />;
}
