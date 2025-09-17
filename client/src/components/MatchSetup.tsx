import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, Calculator } from "lucide-react";
import { Player, InsertMatch } from "@shared/schema";

interface MatchSetupProps {
  players: Player[];
  onCalculateFees: (matchData: InsertMatch) => void;
}

export default function MatchSetup({ players, onCalculateFees }: MatchSetupProps) {
  const [matchData, setMatchData] = useState({
    opponentTeam: '',
    totalFees: '',
    date: new Date().toISOString().split('T')[0],
    selectedPlayers: [] as string[]
  });

  const toggleInProgress = useRef(false);

  const handlePlayerToggle = (playerId: string) => {
    if (toggleInProgress.current) return;
    toggleInProgress.current = true;
    
    setMatchData(prev => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.includes(playerId)
        ? prev.selectedPlayers.filter(id => id !== playerId)
        : [...prev.selectedPlayers, playerId]
    }));
    
    setTimeout(() => {
      toggleInProgress.current = false;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalFees = parseFloat(matchData.totalFees);
    if (isNaN(totalFees) || totalFees <= 0) {
      alert('Please enter valid total fees');
      return;
    }

    if (matchData.selectedPlayers.length === 0) {
      alert('Please select at least one player');
      return;
    }

    if (matchData.selectedPlayers.length < 11 || matchData.selectedPlayers.length > 12) {
      alert('Team must have 11-12 players');
      return;
    }

    // Calculate fee split
    const selectedPlayerData = players.filter(p => matchData.selectedPlayers.includes(p.id));
    const corePlayers = selectedPlayerData.filter(p => p.category === 'core');
    const selfPaidPlayers = selectedPlayerData.filter(p => p.category === 'self_paid');
    const unpaidPlayers = selectedPlayerData.filter(p => p.category === 'unpaid');
    
    const perPlayerAmount = totalFees / matchData.selectedPlayers.length;
    const unpaidTotal = unpaidPlayers.length * perPlayerAmount;
    const coreShareExtra = corePlayers.length > 0 ? unpaidTotal / corePlayers.length : 0;

    const payments = selectedPlayerData.map(player => ({
      playerId: player.id,
      amount: player.category === 'core' ? perPlayerAmount + coreShareExtra : perPlayerAmount,
      paid: false,
      paidBy: player.category === 'unpaid' ? undefined : player.id
    }));

    onCalculateFees({
      opponentTeam: matchData.opponentTeam,
      totalFees,
      date: matchData.date,
      selectedPlayers: matchData.selectedPlayers,
      feeSplit: {
        perPlayerAmount,
        coreShareExtra,
        totalPlayers: matchData.selectedPlayers.length,
        corePlayers: corePlayers.length,
        selfPaidPlayers: selfPaidPlayers.length,
        unpaidPlayers: unpaidPlayers.length
      },
      payments
    });
  };

  const activePlayersCount = players.filter(p => p.isActive).length;
  const selectedCount = matchData.selectedPlayers.length;
  
  // Order players: Core -> Self Paid -> Unpaid (then by name)
  const categoryOrder: Record<string, number> = { core: 0, self_paid: 1, unpaid: 2 };
  const orderedPlayers = players
    .filter(p => p.isActive)
    .slice()
    .sort((a, b) => {
      const catDiff = (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99);
      if (catDiff !== 0) return catDiff;
      return a.name.localeCompare(b.name);
    });

  return (
    <Card data-testid="card-match-setup">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Match Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="opponent" data-testid="label-opponent">Opponent Team</Label>
              <Input
                id="opponent"
                value={matchData.opponentTeam}
                onChange={(e) => setMatchData({ ...matchData, opponentTeam: e.target.value })}
                placeholder="Enter opponent team name"
                required
                data-testid="input-opponent"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fees" data-testid="label-fees">Total Match Fees (₹)</Label>
              <Input
                id="fees"
                type="number"
                min="0"
                step="0.01"
                value={matchData.totalFees}
                onChange={(e) => setMatchData({ ...matchData, totalFees: e.target.value })}
                placeholder="Enter total fees"
                required
                data-testid="input-fees"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" data-testid="label-date">Match Date</Label>
            <Input
              id="date"
              type="date"
              value={matchData.date}
              onChange={(e) => setMatchData({ ...matchData, date: e.target.value })}
              required
              data-testid="input-date"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Select Players</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" data-testid="badge-count">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedCount}/12 selected
                </Badge>
                {(selectedCount < 11 || selectedCount > 12) && (
                  <Badge variant="destructive" className="text-xs">
                    Need 11-12 players
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {orderedPlayers.map((player) => {
                const isSelected = matchData.selectedPlayers.includes(player.id);
                return (
                  <div 
                    key={player.id} 
                    className={`flex items-center space-x-3 p-3 rounded-md border transition-colors cursor-pointer ${
                      isSelected ? 'bg-accent' : 'hover:bg-muted'
                    }`}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => handlePlayerToggle(player.id)}
                    data-testid={`player-item-${player.id}`}
                  >
                    <Checkbox
                      id={`player-${player.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handlePlayerToggle(player.id)}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`checkbox-player-${player.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm" data-testid={`text-player-name-${player.id}`}>
                          {player.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {player.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      {player.phone && (
                        <span className="text-xs text-muted-foreground">
                          {player.phone}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {activePlayersCount === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                No active players available. Add players first.
              </p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full gap-2" 
            disabled={selectedCount === 0 || selectedCount < 11 || selectedCount > 12}
            data-testid="button-calculate"
          >
            <Calculator className="h-4 w-4" />
            Calculate Fees Split
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}