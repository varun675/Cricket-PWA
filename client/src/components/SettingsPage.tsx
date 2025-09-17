import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Smartphone, Shield, Download, Share, Moon, Bell, Wifi, WifiOff } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { usePWA } from "@/hooks/usePWA";

interface SettingsPageProps {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
}

export default function SettingsPage({ 
  isDarkMode, 
  notificationsEnabled, 
  onToggleNotifications 
}: SettingsPageProps) {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    installApp, 
    shareApp, 
    requestNotificationPermission 
  } = usePWA();

  const handleInstallPWA = async () => {
    if (isInstallable) {
      await installApp();
    }
  };

  const handleExportData = () => {
    console.log('Export data triggered');
  };

  const handleShareApp = async () => {
    await shareApp();
  };

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      onToggleNotifications(true);
    }
  };

  return (
    <div className="space-y-6 pb-20" data-testid="page-settings">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your preferences
          </p>
        </div>
      </div>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            App Preferences
          </CardTitle>
          <CardDescription>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive payment reminders
                </p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationPermission}
              data-testid="switch-notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <div>
                <Label className="text-sm font-medium">Connection Status</Label>
                <p className="text-xs text-muted-foreground">
                  {isOnline ? 'Online - All features available' : 'Offline - Limited functionality'}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* PWA Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progressive Web App</CardTitle>
          <CardDescription>
            Install United77 on your device for native app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {isInstalled ? (
              <div className="text-center py-4">
                <Badge className="mb-2">✓ App Installed</Badge>
                <p className="text-sm text-muted-foreground">
                  United77 is installed on your device
                </p>
              </div>
            ) : isInstallable ? (
              <Button 
                onClick={handleInstallPWA}
                className="w-full gap-2"
                data-testid="button-install-pwa"
              >
                <Download className="h-4 w-4" />
                Install on Device
              </Button>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Installation not available on this device
                </p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Works offline without internet</p>
              <p>• Add to home screen like native app</p>
              <p>• Faster loading and better performance</p>
              <p>• Secure data storage on your device</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Data Management
          </CardTitle>
          <CardDescription>
            Control your team and match data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="w-full gap-2"
            data-testid="button-export-data"
          >
            <Download className="h-4 w-4" />
            Export All Data
          </Button>
          
          <div className="text-xs text-muted-foreground">
            <p>Export includes players, match history, and PDF records</p>
          </div>
        </CardContent>
      </Card>

      {/* Share App */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Share United77</CardTitle>
          <CardDescription>
            Help other cricket teams discover this app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleShareApp}
            className="w-full gap-2"
            data-testid="button-share-app"
          >
            <Share className="h-4 w-4" />
            Share with Friends
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About United77</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Version</span>
            <Badge variant="outline">1.0.0</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Storage Used</span>
            <span className="text-muted-foreground">Local Device</span>
          </div>
          <div className="text-xs text-muted-foreground pt-2 space-y-1">
            <p>Cricket team fee splitting made simple</p>
            <p>All data stored securely on your device</p>
            <p>No internet required after installation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}