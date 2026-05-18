import { AppMenu } from "./AppMenu";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return <AppMenu title={title} />;
}