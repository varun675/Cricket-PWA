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

// Mock contacts for demo purposes
//todo: remove mock functionality
const mockContacts = [
  { name: "Arun Kumar", phone: "+91 99888 77766" },
  { name: "Deepak Sharma", phone: "+91 88777 66655" }, 
  { name: "Karan Singh", phone: "+91 77666 55544" },
  { name: "Raj Patel", phone: "+91 66555 44433" },
  { name: "Suresh Gupta", phone: "+91 55444 33322" }
];

export default function AddPlayerModal({ onAddPlayer, existingPlayers }: AddPlayerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('core');
  const [selectedMode, setSelectedMode] = useState<'manual' | 'contacts'>('manual');
  const [uploadedContacts, setUploadedContacts] = useState<typeof mockContacts>([]);
  const [deviceContacts, setDeviceContacts] = useState<typeof mockContacts>([]);
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

  const handleContactSelect = (contact: typeof mockContacts[0]) => {
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

  // Native contact picker function
  const handleNativeContactPicker = async () => {
    if (!isContactPickerSupported()) {
      alert('Contact picker is not supported on this device. Please use manual entry or upload a file.');
      return;
    }

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
    } catch (error) {
      console.error('Error accessing contacts:', error);
      alert('Unable to access contacts. Please check permissions or use manual entry.');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleContactUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          parseContactsFile(text);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const parseContactsFile = (content: string) => {
    try {
      const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
      const newContacts: typeof mockContacts = [];
      
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

  const availableContacts = [...mockContacts, ...uploadedContacts, ...deviceContacts].filter(contact => 
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
                            const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                            const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                            const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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