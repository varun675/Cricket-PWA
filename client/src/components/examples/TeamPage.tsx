import TeamPage from '../TeamPage';
import { Player, PlayerCategory, InsertPlayer } from '@shared/schema';

export default function TeamPageExample() {
  const samplePlayers: Player[] = [
    { id: '1', name: 'Arjun Patel', phone: '+91 98765 43210', category: PlayerCategory.CORE, isActive: true },
    { id: '2', name: 'Rohit Kumar', phone: '+91 87654 32109', category: PlayerCategory.SELF_PAID, isActive: true },
    { id: '3', name: 'Vikas Singh', category: PlayerCategory.UNPAID, isActive: true },
    { id: '4', name: 'Amit Sharma', phone: '+91 76543 21098', category: PlayerCategory.CORE, isActive: true },
    { id: '5', name: 'Karan Gupta', category: PlayerCategory.SELF_PAID, isActive: true },
    { id: '6', name: 'Deepak Verma', phone: '+91 65432 10987', category: PlayerCategory.UNPAID, isActive: false },
  ];

  const handleAddPlayer = (player: InsertPlayer) => {
    console.log('Adding player:', player);
  };

  const handleRemovePlayer = (id: string) => {
    console.log('Removing player:', id);
  };

  const handleWhatsAppPlayer = (player: Player) => {
    console.log('WhatsApp player:', player.name);
  };

  return (
    <div className="p-4">
      <TeamPage 
        players={samplePlayers}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onWhatsAppPlayer={handleWhatsAppPlayer}
      />
    </div>
  );
}