import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, TrendingUp, CalendarDays, Calculator, History } from "lucide-react";

interface HomePageProps {
  playerCount: number;
  recentMatches: number;
  onNavigate: (tab: string) => void;
}

export default function HomePage({ playerCount, recentMatches, onNavigate }: HomePageProps) {
  return (
    <div className="space-y-6 pb-20" data-testid="page-home">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">United77</h1>
            <p className="text-primary-foreground/90 text-sm">Cricket Team Fee Manager</p>
          </div>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          Manage team fees, track payments, and split costs fairly among players.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-player-count">{playerCount}</p>
                <p className="text-xs text-muted-foreground">Active Players</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-recent-matches">{recentMatches}</p>
                <p className="text-xs text-muted-foreground">Recent Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Quick Actions
        </h2>
        
        <div className="space-y-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => onNavigate('calculate')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Calculate Match Fees</h3>
                    <p className="text-sm text-muted-foreground">Split fees for upcoming match</p>
                  </div>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate cursor-pointer" onClick={() => onNavigate('team')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-2/20 rounded-lg">
                    <Users className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Team</h3>
                    <p className="text-sm text-muted-foreground">Add or remove players</p>
                  </div>
                </div>
                <Badge variant="secondary">{playerCount} players</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate cursor-pointer" onClick={() => onNavigate('history')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-3/20 rounded-lg">
                    <History className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <h3 className="font-medium">View History</h3>
                    <p className="text-sm text-muted-foreground">Past matches and PDFs</p>
                  </div>
                </div>
                <Badge variant="outline">{recentMatches} files</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">💡 Tips</CardTitle>
          <CardDescription className="text-sm">
            Make team fee management easier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Add players from your contacts for quick setup</p>
          <p>• Core members automatically share unpaid player fees</p>
          <p>• Generate PDFs to keep records of all matches</p>
          <p>• Send WhatsApp reminders for payment collection</p>
        </CardContent>
      </Card>
    </div>
  );
}