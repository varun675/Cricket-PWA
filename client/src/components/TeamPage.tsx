import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Filter } from "lucide-react";
import { Player, InsertPlayer, PlayerCategory } from "@shared/schema";
import PlayerCard from "./PlayerCard";
import AddPlayerModal from "./AddPlayerModal";

interface TeamPageProps {
  players: Player[];
  onAddPlayer: (player: InsertPlayer) => void;
  onRemovePlayer: (id: string) => void;
  onWhatsAppPlayer: (player: Player) => void;
}

export default function TeamPage({ 
  players, 
  onAddPlayer, 
  onRemovePlayer, 
  onWhatsAppPlayer 
}: TeamPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredPlayers = players
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (player.phone && player.phone.includes(searchTerm));
      
      const matchesFilter = activeFilter === 'all' || 
                           (activeFilter === 'active' && player.isActive) ||
                           (activeFilter === 'inactive' && !player.isActive) ||
                           player.category === activeFilter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Define category priority: Core (0), Self-Paid (1), Unpaid (2)
      const categoryPriority = {
        [PlayerCategory.CORE]: 0,
        [PlayerCategory.SELF_PAID]: 1,
        [PlayerCategory.UNPAID]: 2
      };
      
      const priorityA = categoryPriority[a.category];
      const priorityB = categoryPriority[b.category];
      
      // First sort by category
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Then sort by name within same category
      return a.name.localeCompare(b.name);
    });

  const getPlayerCounts = () => {
    const active = players.filter(p => p.isActive);
    return {
      total: active.length,
      core: active.filter(p => p.category === PlayerCategory.CORE).length,
      selfPaid: active.filter(p => p.category === PlayerCategory.SELF_PAID).length,
      unpaid: active.filter(p => p.category === PlayerCategory.UNPAID).length
    };
  };

  const counts = getPlayerCounts();
  const canPlayMatch = counts.total >= 11 && counts.total <= 12;

  return (
    <div className="space-y-6 pb-20" data-testid="page-team">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Team Management</h1>
            <p className="text-sm text-muted-foreground">
              {counts.total} active players
            </p>
          </div>
        </div>
        <AddPlayerModal onAddPlayer={onAddPlayer} existingPlayers={players} />
      </div>

      {/* Team Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Team Status</h3>
            <Badge 
              variant={canPlayMatch ? "default" : "destructive"}
              data-testid="badge-team-status"
            >
              {canPlayMatch ? "Ready for Match" : "Need 11-12 Players"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-primary" data-testid="text-total-count">{counts.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-chart-1" data-testid="text-core-count">{counts.core}</p>
              <p className="text-xs text-muted-foreground">Core</p>
            </div>
            <div>
              <p className="text-lg font-bold text-chart-2" data-testid="text-self-paid-count">{counts.selfPaid}</p>
              <p className="text-xs text-muted-foreground">Self Paid</p>
            </div>
            <div>
              <p className="text-lg font-bold text-chart-3" data-testid="text-unpaid-count">{counts.unpaid}</p>
              <p className="text-xs text-muted-foreground">Unpaid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
        
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
            <TabsTrigger value={PlayerCategory.CORE} data-testid="filter-core">Core</TabsTrigger>
            <TabsTrigger value={PlayerCategory.SELF_PAID} data-testid="filter-self-paid">Self Paid</TabsTrigger>
            <TabsTrigger value={PlayerCategory.UNPAID} data-testid="filter-unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="inactive" data-testid="filter-inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Players List */}
      <div className="space-y-3">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onRemove={onRemovePlayer}
              onWhatsApp={onWhatsAppPlayer}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchTerm || activeFilter !== 'all' ? 'No players match your filter' : 'No players added yet'}
              </p>
              {!searchTerm && activeFilter === 'all' && (
                <AddPlayerModal onAddPlayer={onAddPlayer} existingPlayers={players} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}