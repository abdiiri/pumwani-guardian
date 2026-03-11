import { AppSidebar } from './AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 min-h-screen">
        <header className="border-b bg-background px-8 py-6">
          <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 font-body">{subtitle}</p>
          )}
        </header>
        <div className="px-8 py-6 max-w-[1280px]">
          {children}
        </div>
      </main>
    </div>
  );
}
