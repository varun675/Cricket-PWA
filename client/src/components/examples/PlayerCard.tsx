import PlayerCard from '../PlayerCard';
import { Player, PlayerCategory } from '@shared/schema';

export default function PlayerCardExample() {
  const samplePlayers: Player[] = [
    {
      id: '1',
      name: 'Arjun Patel',
      phone: '+91 98765 43210',
      category: PlayerCategory.CORE,
      isActive: true
    },
    {
      id: '2', 
      name: 'Rohit Kumar',
      phone: '+91 87654 32109',
      category: PlayerCategory.SELF_PAID,
      isActive: true
    },
    {
      id: '3',
      name: 'Vikas Singh',
      category: PlayerCategory.UNPAID,
      isActive: true
    }
  ];

  return (
    <div className="space-y-4 p-4">
      {samplePlayers.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onRemove={(id) => console.log('Remove player:', id)}
          onWhatsApp={(player) => console.log('WhatsApp player:', player.name)}
        />
      ))}
    </div>
  );
}