import MatchSetup from '../MatchSetup';
import { Player, PlayerCategory } from '@shared/schema';

export default function MatchSetupExample() {
  const samplePlayers: Player[] = [
    { id: '1', name: 'Arjun Patel', phone: '+91 98765 43210', category: PlayerCategory.CORE, isActive: true },
    { id: '2', name: 'Rohit Kumar', phone: '+91 87654 32109', category: PlayerCategory.SELF_PAID, isActive: true },
    { id: '3', name: 'Vikas Singh', category: PlayerCategory.UNPAID, isActive: true },
    { id: '4', name: 'Amit Sharma', phone: '+91 76543 21098', category: PlayerCategory.CORE, isActive: true },
    { id: '5', name: 'Karan Gupta', category: PlayerCategory.SELF_PAID, isActive: true },
    { id: '6', name: 'Deepak Verma', phone: '+91 65432 10987', category: PlayerCategory.UNPAID, isActive: true },
    { id: '7', name: 'Suresh Yadav', category: PlayerCategory.CORE, isActive: true },
    { id: '8', name: 'Rajesh Tiwari', phone: '+91 54321 09876', category: PlayerCategory.SELF_PAID, isActive: true },
    { id: '9', name: 'Manoj Kumar', category: PlayerCategory.UNPAID, isActive: true },
    { id: '10', name: 'Vikram Singh', phone: '+91 43210 98765', category: PlayerCategory.CORE, isActive: true },
    { id: '11', name: 'Ravi Patel', category: PlayerCategory.SELF_PAID, isActive: true },
    { id: '12', name: 'Sanjay Gupta', category: PlayerCategory.UNPAID, isActive: true }
  ];

  const handleCalculateFees = (matchData: any) => {
    console.log('Calculating fees for match:', matchData);
  };

  return (
    <div className="p-4">
      <MatchSetup 
        players={samplePlayers}
        onCalculateFees={handleCalculateFees}
      />
    </div>
  );
}