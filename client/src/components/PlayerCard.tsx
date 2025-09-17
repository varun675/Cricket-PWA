import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Phone, Trash2, MessageCircle } from "lucide-react";
import { Player, PlayerCategory } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  onRemove?: (id: string) => void;
  onWhatsApp?: (player: Player) => void;
  showActions?: boolean;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case PlayerCategory.CORE:
      return "bg-primary text-primary-foreground";
    case PlayerCategory.SELF_PAID:
      return "bg-chart-2 text-primary-foreground";
    case PlayerCategory.UNPAID:
      return "bg-chart-3 text-primary-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case PlayerCategory.CORE:
      return "Core";
    case PlayerCategory.SELF_PAID:
      return "Self Paid";
    case PlayerCategory.UNPAID:
      return "Unpaid";
    default:
      return category;
  }
};

export default function PlayerCard({ 
  player, 
  onRemove, 
  onWhatsApp, 
  showActions = true 
}: PlayerCardProps) {
  const initials = player.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="p-4 hover-elevate" data-testid={`card-player-${player.id}`}>
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground truncate" data-testid={`text-name-${player.id}`}>
              {player.name}
            </h4>
            <Badge 
              className={`text-xs ${getCategoryColor(player.category)}`}
              data-testid={`badge-category-${player.id}`}
            >
              {getCategoryLabel(player.category)}
            </Badge>
          </div>
          {player.phone && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Phone className="h-3 w-3" />
              <span data-testid={`text-phone-${player.id}`}>{player.phone}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {player.phone && onWhatsApp && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onWhatsApp(player)}
                data-testid={`button-whatsapp-${player.id}`}
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {onRemove && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onRemove(player.id)}
                data-testid={`button-remove-${player.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}