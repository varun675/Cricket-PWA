import { Users, Calculator, History, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  playerCount?: number;
  pdfCount?: number;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'calculate', label: 'Calculate', icon: Calculator },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNavigation({ 
  activeTab, 
  onTabChange, 
  playerCount = 0,
  pdfCount = 0 
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" data-testid="bottom-navigation">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 h-auto py-2 px-1 relative ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                
                {/* Notification badges */}
                {item.id === 'team' && playerCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                    data-testid="badge-player-count"
                  >
                    {playerCount > 99 ? '99+' : playerCount}
                  </Badge>
                )}
                
                {item.id === 'history' && pdfCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center bg-chart-2 text-primary-foreground"
                    data-testid="badge-pdf-count"
                  >
                    {pdfCount > 99 ? '99+' : pdfCount}
                  </Badge>
                )}
              </div>
              
              <span className={`text-xs font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}