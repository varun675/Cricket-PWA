import AddPlayerModal from '../AddPlayerModal';
import { Player, PlayerCategory } from '@shared/schema';

export default function AddPlayerModalExample() {
  const existingPlayers: Player[] = [
    {
      id: '1',
      name: 'Arjun Patel',
      phone: '+91 98765 43210',
      category: PlayerCategory.CORE,
      isActive: true
    }
  ];

  const handleAddPlayer = (player: any) => {
    console.log('Adding player:', player);
  };

  return (
    <div className="p-4">
      <AddPlayerModal 
        onAddPlayer={handleAddPlayer}
        existingPlayers={existingPlayers}
      />
    </div>
  );
}