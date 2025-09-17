import { useState } from 'react';
import BottomNavigation from '../BottomNavigation';

export default function BottomNavigationExample() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="h-32 relative">
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Active tab: <span className="font-medium text-foreground">{activeTab}</span>
        </p>
      </div>
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        playerCount={12}
        pdfCount={5}
      />
    </div>
  );
}