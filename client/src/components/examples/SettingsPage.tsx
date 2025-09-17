import { ThemeProvider } from 'next-themes';
import SettingsPage from '../SettingsPage';

export default function SettingsPageExample() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="p-4">
        <SettingsPage
          isDarkMode={false}
          notificationsEnabled={true}
          onToggleNotifications={(enabled) => console.log('Notifications:', enabled)}
        />
      </div>
    </ThemeProvider>
  );
}