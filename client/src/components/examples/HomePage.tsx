import HomePage from '../HomePage';

export default function HomePageExample() {
  return (
    <div className="p-4">
      <HomePage 
        playerCount={12}
        recentMatches={5}
        onNavigate={(tab) => console.log('Navigate to:', tab)}
      />
    </div>
  );
}