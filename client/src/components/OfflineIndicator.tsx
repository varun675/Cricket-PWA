import { usePWA } from '@/hooks/usePWA';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-40 flex justify-center">
      <Badge variant="destructive" className="gap-2 py-2 px-3">
        <WifiOff className="h-3 w-3" />
        You're offline
      </Badge>
    </div>
  );
}
