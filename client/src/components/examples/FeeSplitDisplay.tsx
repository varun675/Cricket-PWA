import FeeSplitDisplay from '../FeeSplitDisplay';
import { Match, Player, PlayerCategory } from '@shared/schema';

export default function FeeSplitDisplayExample() {
  const samplePlayers: Player[] = [
    { id: '1', name: 'Arjun Patel', phone: '+91 98765 43210', category: PlayerCategory.CORE, isActive: true },
    { id: '2', name: 'Rohit Kumar', phone: '+91 87654 32109', category: PlayerCategory.SELF_PAID, isActive: true },
    { id: '3', name: 'Vikas Singh', category: PlayerCategory.UNPAID, isActive: true },
    { id: '4', name: 'Amit Sharma', phone: '+91 76543 21098', category: PlayerCategory.CORE, isActive: true }
  ];

  const sampleMatch: Match = {
    id: '1',
    opponentTeam: 'Delhi Warriors',
    totalFees: 2400,
    date: '2024-01-15',
    selectedPlayers: ['1', '2', '3', '4'],
    feeSplit: {
      perPlayerAmount: 600,
      coreShareExtra: 300,
      totalPlayers: 4,
      corePlayers: 2,
      selfPaidPlayers: 1,
      unpaidPlayers: 1
    },
    payments: [
      { playerId: '1', amount: 900, paid: false, paidBy: '1' }, // Core: 600 + 300
      { playerId: '4', amount: 900, paid: false, paidBy: '4' }, // Core: 600 + 300  
      { playerId: '2', amount: 600, paid: false, paidBy: '2' }, // Self paid
      { playerId: '3', amount: 600, paid: false } // Unpaid (covered by core)
    ],
    createdAt: '2024-01-15T10:00:00Z'
  };

  return (
    <div className="p-4">
      <FeeSplitDisplay 
        match={sampleMatch}
        players={samplePlayers}
        onGeneratePDF={() => console.log('Generate PDF')}
        onShareWhatsApp={() => console.log('Share WhatsApp')}
      />
    </div>
  );
}