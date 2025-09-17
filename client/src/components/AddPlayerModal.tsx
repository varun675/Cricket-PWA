import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, UserPlus, Contact, Phone, Upload, Shield, Wallet, Users, Smartphone } from "lucide-react";
import { Player, PlayerCategory, InsertPlayer } from "@shared/schema";

interface AddPlayerModalProps {
  onAddPlayer: (player: InsertPlayer) => void;
  existingPlayers: Player[];
}

// No mock contacts - users will add their own contacts
type Contact = {
  name: string;
  phone: string;
};

export default function AddPlayerModal({ onAddPlayer, existingPlayers }: AddPlayerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('core');
  const [selectedMode, setSelectedMode] = useState<'manual' | 'contacts'>('manual');
  const [uploadedContacts, setUploadedContacts] = useState<Contact[]>([]);
  const [deviceContacts, setDeviceContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [formData, setFormData] = useState<InsertPlayer>({
    name: '',
    phone: '',
    category: PlayerCategory.CORE,
    isActive: true
  });

  // Update category when section changes
  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    const categoryMap: Record<string, typeof PlayerCategory[keyof typeof PlayerCategory]> = {
      'core': PlayerCategory.CORE,
      'selfpaid': PlayerCategory.SELF_PAID,
      'unpaid': PlayerCategory.UNPAID
    };
    setFormData(prev => ({ ...prev, category: categoryMap[section] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddPlayer({
        ...formData,
        phone: formData.phone?.trim() || undefined
      });
      setFormData({
        name: '',
        phone: '',
        category: PlayerCategory.CORE,
        isActive: true
      });
      setIsOpen(false);
      setSelectedMode('manual');
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setFormData(prev => ({
      ...prev,
      name: contact.name,
      phone: contact.phone
    }));
    setSelectedMode('manual');
  };

  // Check if Contact Picker API is supported
  const isContactPickerSupported = () => {
    return 'contacts' in navigator && 'ContactsManager' in window;
  };

  // Check if we're on mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Alternative contact access methods
  const handleAlternativeContactAccess = () => {
    const isMobile = isMobileDevice();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let message = "Contact access options:\n\n";
    
    if (isIOS) {
      message += "📱 iOS Options:\n";
      message += "1. Use Safari browser for better PWA support\n";
      message += "2. Install this app to home screen first\n";
      message += "3. Try the 'Upload' button to import contacts from Files app\n";
      message += "4. Use manual entry for individual contacts\n\n";
      message += "💡 Tip: Export contacts from Contacts app as vCard, then upload here";
    } else if (isAndroid) {
      message += "📱 Android Options:\n";
      message += "1. Use Chrome browser for best support\n";
      message += "2. Try the 'Upload' button to import contacts CSV\n";
      message += "3. Export contacts from Google Contacts as CSV\n";
      message += "4. Use manual entry for individual contacts\n\n";
      message += "💡 Tip: Go to contacts.google.com → Export → CSV format";
    } else {
      message += "💻 Desktop/Other:\n";
      message += "1. Export contacts from your phone/email as CSV\n";
      message += "2. Use the 'Upload' button to import the file\n";
      message += "3. Use manual entry for individual contacts\n";
    }

    alert(message);
  };

  // Native contact picker function with fallbacks
  const handleNativeContactPicker = async () => {
    // First try the Contact Picker API
    if (isContactPickerSupported()) {
      setIsLoadingContacts(true);
      try {
        // @ts-ignore - ContactsManager is not in TypeScript types yet
        const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
        
        const formattedContacts = contacts
          .filter((contact: any) => contact.name && contact.tel && contact.tel.length > 0)
          .map((contact: any) => ({
            name: contact.name[0] || 'Unknown',
            phone: contact.tel[0] || ''
          }))
          .filter((contact: any) => !isPlayerExists(contact.name));

        setDeviceContacts(prev => {
          // Merge with existing, avoiding duplicates
          const merged = [...prev];
          for (const contact of formattedContacts) {
            if (!merged.some(c => 
              c.name.toLowerCase() === contact.name.toLowerCase() || 
              c.phone.replace(/\s+/g, '') === contact.phone.replace(/\s+/g, '')
            )) {
              merged.push(contact);
            }
          }
          return merged;
        });

        if (formattedContacts.length > 0) {
          setSelectedMode('contacts');
        }
        return;
      } catch (error) {
        console.error('Error accessing contacts:', error);
        // Fall through to alternative methods
      } finally {
        setIsLoadingContacts(false);
      }
    }

    // If Contact Picker API fails or isn't supported, show alternatives
    handleAlternativeContactAccess();
  };

  const handleContactUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt,.vcf,.vcard'; // Added vCard support for iOS
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const fileName = file.name.toLowerCase();
          
          if (fileName.endsWith('.vcf') || fileName.endsWith('.vcard')) {
            parseVCardFile(text);
          } else {
            parseContactsFile(text);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const parseVCardFile = (content: string) => {
    try {
      const vcardBlocks = content.split(/BEGIN:VCARD/i).filter(block => block.trim().length > 0);
      const newContacts: Contact[] = [];
      
      for (const block of vcardBlocks) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let name = '';
        let phone = '';
        
        for (const line of lines) {
          // Parse name (FN field)
          if (line.startsWith('FN:')) {
            name = line.substring(3).trim();
          }
          // Parse phone (TEL field)
          else if (line.startsWith('TEL') && line.includes(':')) {
            const phoneMatch = line.match(/:([+\d\s\-\(\)]+)$/);
            if (phoneMatch) {
              phone = phoneMatch[1].trim();
            }
          }
        }
        
        if (name && phone && name.length > 1 && phone.length >= 10 && !isPlayerExists(name)) {
          // Normalize phone number format
          const normalizedPhone = phone.startsWith('+') ? phone : `+91 ${phone}`;
          newContacts.push({ name, phone: normalizedPhone });
        }
      }
      
      if (newContacts.length > 0) {
        setUploadedContacts(prev => {
          const merged = [...prev];
          for (const contact of newContacts) {
            if (!merged.some(c => 
              c.name.toLowerCase() === contact.name.toLowerCase() || 
              c.phone.replace(/\s+/g, '') === contact.phone.replace(/\s+/g, '')
            )) {
              merged.push(contact);
            }
          }
          return merged;
        });
        console.log(`Successfully uploaded ${newContacts.length} contacts from vCard file`);
        setSelectedMode('contacts');
      } else {
        console.log('No valid contacts found in the vCard file');
      }
    } catch (error) {
      console.error('Error parsing vCard file:', error);
      alert('Error reading vCard file. Please try a different format or use manual entry.');
    }
  };

  const parseContactsFile = (content: string) => {
    try {
      const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
      const newContacts: Contact[] = [];
      
      // Skip header row if detected
      let startIndex = 0;
      if (lines.length > 0) {
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('name') && (firstLine.includes('phone') || firstLine.includes('number'))) {
          startIndex = 1;
        }
      }
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Support CSV with quotes, tabs, and simple comma separation
        const parts = line.includes('"') 
          ? line.split(',').map(part => part.replace(/^"(.*)"$/, '$1').trim())
          : line.includes(',') 
          ? line.split(',').map(part => part.trim())
          : line.split('\t').map(part => part.trim());
        
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const phone = parts[1].trim();
          
          // Basic validation
          if (name && phone && name.length > 1 && phone.length >= 10 && !isPlayerExists(name)) {
            // Normalize phone number format
            const normalizedPhone = phone.startsWith('+') ? phone : `+91 ${phone}`;
            newContacts.push({ name, phone: normalizedPhone });
          }
        }
      }
      
      if (newContacts.length > 0) {
        setUploadedContacts(prev => {
          // Merge with existing, avoiding duplicates by name or phone
          const merged = [...prev];
          for (const contact of newContacts) {
            if (!merged.some(c => 
              c.name.toLowerCase() === contact.name.toLowerCase() || 
              c.phone.replace(/\s+/g, '') === contact.phone.replace(/\s+/g, '')
            )) {
              merged.push(contact);
            }
          }
          return merged;
        });
        console.log(`Successfully uploaded ${newContacts.length} new contacts`);
      } else {
        console.log('No valid contacts found in the uploaded file');
      }
    } catch (error) {
      console.error('Error parsing contacts file:', error);
    }
  };

  const isPlayerExists = (name: string) => {
    return existingPlayers.some(player => 
      player.name.toLowerCase() === name.toLowerCase()
    );
  };

  const availableContacts = [...uploadedContacts, ...deviceContacts].filter(contact => 
    !isPlayerExists(contact.name)
  );

  const getSectionConfig = (section: string) => {
    const configs = {
      'core': {
        title: 'Add Core Member',
        icon: Shield,
        description: 'Core members share costs for unpaid players',
        color: 'text-chart-1',
        bgColor: 'bg-chart-1/20'
      },
      'selfpaid': {
        title: 'Add Self-Paid Player',
        icon: Wallet,
        description: 'Players who pay their own fees',
        color: 'text-chart-2',
        bgColor: 'bg-chart-2/20'
      },
      'unpaid': {
        title: 'Add Unpaid Player',
        icon: Users,
        description: 'Players whose fees are covered by core members',
        color: 'text-chart-3',
        bgColor: 'bg-chart-3/20'
      }
    };
    return configs[section as keyof typeof configs];
  };

  const currentConfig = getSectionConfig(selectedSection);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2" 
          data-testid="button-add-player"
        >
          <Plus className="h-4 w-4" />
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-add-player">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Team Player
          </DialogTitle>
        </DialogHeader>
        
        {/* Player Category Sections */}
        <Tabs value={selectedSection} onValueChange={handleSectionChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="core" data-testid="section-core" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Core</span>
            </TabsTrigger>
            <TabsTrigger value="selfpaid" data-testid="section-selfpaid" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Self-Paid</span>
            </TabsTrigger>
            <TabsTrigger value="unpaid" data-testid="section-unpaid" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Unpaid</span>
            </TabsTrigger>
          </TabsList>

          {/* Core Members Section */}
          <TabsContent value="core" className="space-y-4">
            {currentConfig && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentConfig.bgColor}`}>
                      <currentConfig.icon className={`h-5 w-5 ${currentConfig.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{currentConfig.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Manual/Contacts Toggle */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant={selectedMode === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMode('manual')}
                      data-testid="mode-manual"
                    >
                      Manual Entry
                    </Button>
                    <Button
                      type="button"
                      variant={selectedMode === 'contacts' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMode('contacts')}
                      data-testid="mode-contacts"
                    >
                      From Contacts
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleNativeContactPicker}
                      disabled={isLoadingContacts}
                      className="gap-2"
                      data-testid="button-device-contacts"
                    >
                      <Smartphone className="h-3 w-3" />
                      {isLoadingContacts ? 'Loading...' : 'Device Contacts'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleContactUpload}
                      className="gap-2"
                      data-testid="button-upload-contacts"
                    >
                      <Upload className="h-3 w-3" />
                      Upload
                    </Button>
                  </div>

                  {/* Contact Selection Mode */}
                  {selectedMode === 'contacts' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Contact className="h-4 w-4" />
                        <span>Select from your contacts</span>
                      </div>
                      
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {availableContacts.length > 0 ? (
                          availableContacts.map((contact, index) => {
                            const initials = contact.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                            return (
                              <Card 
                                key={index} 
                                className="p-3 cursor-pointer hover-elevate" 
                                onClick={() => handleContactSelect(contact)}
                                data-testid={`contact-item-${index}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{contact.name}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {contact.phone}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            All contacts are already added to the team
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual Entry Form */}
                  {selectedMode === 'manual' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" data-testid="label-name">Player Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter player name"
                          required
                          data-testid="input-name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" data-testid="label-phone">
                          Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          data-testid="input-phone"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsOpen(false)}
                          className="flex-1"
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="flex-1"
                          data-testid="button-submit"
                        >
                          Add {selectedSection === 'core' ? 'Core Member' : 
                                selectedSection === 'selfpaid' ? 'Self-Paid Player' : 
                                'Unpaid Player'}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Self-Paid Section */}
          <TabsContent value="selfpaid" className="space-y-4">
            {currentConfig && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentConfig.bgColor}`}>
                      <currentConfig.icon className={`h-5 w-5 ${currentConfig.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{currentConfig.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Manual/Contacts Toggle */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant={selectedMode === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMode('manual')}
                      data-testid="mode-manual"
                    >
                      Manual Entry
                    </Button>
                    <Button
                      type="button"
                      variant={selectedMode === 'contacts' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMode('contacts')}
                      data-testid="mode-contacts"
                    >
                      From Contacts
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleNativeContactPicker}
                      disabled={isLoadingContacts}
                      className="gap-2"
                      data-testid="button-device-contacts"
                    >
                      <Smartphone className="h-3 w-3" />
                      {isLoadingContacts ? 'Loading...' : 'Device Contacts'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleContactUpload}
                      className="gap-2"
                      data-testid="button-upload-contacts"
                    >
                      <Upload className="h-3 w-3" />
                      Upload
                    </Button>
                  </div>

                  {/* Contact Selection Mode */}
                  {selectedMode === 'contacts' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Contact className="h-4 w-4" />
                        <span>Select from your contacts</span>
                      </div>
                      
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {availableContacts.length > 0 ? (
                          availableContacts.map((contact, index) => {
                            const initials = contact.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                            return (
                              <Card 
                                key={index} 
                                className="p-3 cursor-pointer hover-elevate" 
                                onClick={() => handleContactSelect(contact)}
                                data-testid={`contact-item-${index}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{contact.name}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {contact.phone}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            All contacts are already added to the team
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual Entry Form */}
                  {selectedMode === 'manual' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" data-testid="label-name">Player Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter player name"
                          required
                          data-testid="input-name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" data-testid="label-phone">
                          Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          data-testid="input-phone"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsOpen(false)}
                          className="flex-1"
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="flex-1"
                          data-testid="button-submit"
                        >
                          Add Self-Paid Player
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Unpaid Section */}
          <TabsContent value="unpaid" className="space-y-4">
            {currentConfig && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentConfig.bgColor}`}>
                      <currentConfig.icon className={`h-5 w-5 ${currentConfig.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{currentConfig.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Manual/Contacts Toggle */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant={selectedMode === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMode('manual')}
                      data-testid="mode-manual"
                    >
                      Manual Entry
                    </Button>
                    <Button
                      type="button"
                      variant={selectedMode === 'contacts' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMode('contacts')}
                      data-testid="mode-contacts"
                    >
                      From Contacts
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleNativeContactPicker}
                      disabled={isLoadingContacts}
                      className="gap-2"
                      data-testid="button-device-contacts"
                    >
                      <Smartphone className="h-3 w-3" />
                      {isLoadingContacts ? 'Loading...' : 'Device Contacts'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleContactUpload}
                      className="gap-2"
                      data-testid="button-upload-contacts"
                    >
                      <Upload className="h-3 w-3" />
                      Upload
                    </Button>
                  </div>

                  {/* Contact Selection Mode */}
                  {selectedMode === 'contacts' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Contact className="h-4 w-4" />
                        <span>Select from your contacts</span>
                      </div>
                      
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {availableContacts.length > 0 ? (
                          availableContacts.map((contact, index) => {
                            const initials = contact.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                            return (
                              <Card 
                                key={index} 
                                className="p-3 cursor-pointer hover-elevate" 
                                onClick={() => handleContactSelect(contact)}
                                data-testid={`contact-item-${index}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{contact.name}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {contact.phone}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            All contacts are already added to the team
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual Entry Form */}
                  {selectedMode === 'manual' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" data-testid="label-name">Player Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter player name"
                          required
                          data-testid="input-name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" data-testid="label-phone">
                          Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          data-testid="input-phone"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsOpen(false)}
                          className="flex-1"
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="flex-1"
                          data-testid="button-submit"
                        >
                          Add Unpaid Player
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}