import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Player, InsertPlayer, Match, InsertMatch, PDFHistory, PlayerCategory } from "@shared/schema";
import BottomNavigation from "@/components/BottomNavigation";
import HomePage from "@/components/HomePage";
import TeamPage from "@/components/TeamPage";
import MatchSetup from "@/components/MatchSetup";
import FeeSplitDisplay from "@/components/FeeSplitDisplay";
import PDFHistoryPage from "@/components/PDFHistoryPage";
import SettingsPage from "@/components/SettingsPage";
import ThemeToggle from "@/components/ThemeToggle";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['home']);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Load players from localStorage on app start
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const savedPlayers = localStorage.getItem('united77-players');
      return savedPlayers ? JSON.parse(savedPlayers) : [];
    } catch (error) {
      console.error('Error loading players from localStorage:', error);
      return [];
    }
  });
  
  // Load PDF history from localStorage on app start
  const [pdfHistory, setPdfHistory] = useState<PDFHistory[]>(() => {
    try {
      const savedHistory = localStorage.getItem('united77-pdf-history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading PDF history from localStorage:', error);
      return [];
    }
  });

  // Save players to localStorage whenever players array changes
  useEffect(() => {
    try {
      localStorage.setItem('united77-players', JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players to localStorage:', error);
    }
  }, [players]);

  // Save PDF history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('united77-pdf-history', JSON.stringify(pdfHistory));
    } catch (error) {
      console.error('Error saving PDF history to localStorage:', error);
    }
  }, [pdfHistory]);

  // Check URL params for direct navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['home', 'team', 'calculate', 'history', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Keep app state in sync with browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'home';
      if (['home', 'team', 'calculate', 'calculate-result', 'history', 'settings'].includes(tab)) {
        // Update active tab
        setActiveTab(tab);
        // Reconcile our navigation history with the new tab
        setNavigationHistory((prev) => {
          const idx = prev.lastIndexOf(tab);
          if (idx >= 0) {
            // Trim forward entries when navigating back
            return prev.slice(0, idx + 1);
          }
          // Push new entry when navigating forward to a new tab
          return [...prev, tab];
        });
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleAddPlayer = (newPlayer: InsertPlayer) => {
    const player: Player = {
      ...newPlayer,
      id: Date.now().toString()
    };
    setPlayers(prev => [...prev, player]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleWhatsAppPlayer = (player: Player) => {
    if (player.phone) {
      let message = `Hi ${player.name}!\n\n`;
      
      if (currentMatch) {
        // If there's an active match, send match details
        message += `*United77 vs ${currentMatch.opponentTeam}*\n`;
        message += `Date: ${currentMatch.date}\n`;
        message += `Total Match Fees: Rs.${currentMatch.totalFees}\n\n`;
        
        // Customize message based on player category
        switch (player.category) {
          case PlayerCategory.CORE:
            message += `As a Core Member, your share is:\n`;
            message += `Base amount: Rs.${currentMatch.feeSplit.perPlayerAmount.toFixed(2)}\n`;
            if (currentMatch.feeSplit.coreShareExtra > 0) {
              message += `Extra for unpaid players: Rs.${currentMatch.feeSplit.coreShareExtra.toFixed(2)}\n`;
              message += `*Total to pay: Rs.${(currentMatch.feeSplit.perPlayerAmount + currentMatch.feeSplit.coreShareExtra).toFixed(2)}*\n\n`;
            } else {
              message += `*Total to pay: Rs.${currentMatch.feeSplit.perPlayerAmount.toFixed(2)}*\n\n`;
            }
            message += `Thank you for being a core member and supporting the team!`;
            break;
            
          case PlayerCategory.SELF_PAID:
            message += `As a Self-Paid player:\n`;
            message += `*Your share: Rs.${currentMatch.feeSplit.perPlayerAmount.toFixed(2)}*\n\n`;
            message += `Please pay your share for the match. Thanks!`;
            break;
            
          case PlayerCategory.UNPAID:
            message += `Good news! Your fees are covered by our core members.\n`;
            message += `Just focus on playing your best cricket!\n\n`;
            message += `Remember to appreciate our core members who make this possible.`;
            break;
        }
        
        message += `\n\n*Generated by United77 Team Manager*`;
        
      } else {
        // General reminder when no active match
        message += `This is a reminder about upcoming cricket match fees.\n\n`;
        
        switch (player.category) {
          case PlayerCategory.CORE:
            message += `As a Core Member, you'll be notified about your fee share once match details are finalized. Thank you for your support!`;
            break;
          case PlayerCategory.SELF_PAID:
            message += `As a Self-Paid player, please be ready to pay your share when the match is confirmed.`;
            break;
          case PlayerCategory.UNPAID:
            message += `Your fees will be covered by our core members. Just be ready to play!`;
            break;
        }
        
        message += `\n\nThanks! - United77 Team`;
      }
      
      const whatsappUrl = `https://wa.me/${player.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleCalculateFees = (matchData: InsertMatch) => {
    const match: Match = {
      ...matchData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCurrentMatch(match);
    // Switch to results view and push a new history state so back returns to Calculate
    setActiveTab('calculate-result');
    setNavigationHistory((prev) => [...prev, 'calculate-result']);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'calculate-result');
    window.history.pushState({}, '', url.toString());
  };

  const handleGeneratePDF = (payerId?: string) => {
    if (!currentMatch) return;
    const title = `United77 vs ${currentMatch.opponentTeam} - Fee Split`;
    const filename = `United77_vs_${currentMatch.opponentTeam.replace(/\s+/g, '_')}_${currentMatch.date}.pdf`;

    const getPlayerById = (id: string) => players.find(p => p.id === id);
    const payer = payerId ? getPlayerById(payerId) : undefined;
    const payerPayment = payerId ? currentMatch.payments.find(p => p.playerId === payerId) : undefined;
    const payerReturn = payer && payerPayment ? (currentMatch.totalFees - payerPayment.amount) : 0;

    // Build printable HTML content
    const paymentRows = currentMatch.payments
      .map((p) => {
        const player = players.find(pl => pl.id === p.playerId);
        const name = player?.name || p.playerId;
        const rawCategory = player?.category || '';
        const category = rawCategory.replace('_',' ');
        const isUnpaid = player?.category === PlayerCategory.UNPAID;
        const amountDue = isUnpaid ? 0 : p.amount;
        const note = isUnpaid ? 'covered by core' : '';
        const payTo = payer && !isUnpaid && player?.id !== payerId ? payer.name : '';
        return `<tr>
          <td style="padding:8px;border:1px solid #ddd;">${name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-transform:capitalize;">${category}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${amountDue.toFixed(2)}</td>
          <td style="padding:8px;border:1px solid #ddd;">${note}</td>
          ${payer ? `<td style=\"padding:8px;border:1px solid #ddd;\">${payTo}</td>` : ''}
        </tr>`;
      })
      .join('');

    const collectionTotal = currentMatch.payments.reduce((sum, p) => {
      const player = players.find(pl => pl.id === p.playerId);
      return sum + (player?.category === 'unpaid' ? 0 : p.amount);
    }, 0);

    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; padding: 24px; color: #111827; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          h2 { font-size: 16px; margin: 16px 0 8px; }
          .muted { color: #6b7280; font-size: 12px; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; }
          th { text-align: left; background: #f3f4f6; border: 1px solid #ddd; padding: 8px; }
          .total { font-weight: 700; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="muted">Date: ${currentMatch.date}</div>
        <div class="muted">Total Fees: ₹${currentMatch.totalFees.toFixed(2)} | Players: ${currentMatch.feeSplit.totalPlayers}</div>
        ${payer ? `<div class=\"muted\" style=\"margin-top:6px;\"><strong>Paid by:</strong> ${payer.name} &nbsp; | &nbsp; <strong>To be returned:</strong> ₹${payerReturn.toFixed(2)}</div>` : ''}
        <h2>Payments</h2>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Category</th>
              <th style="text-align:right;">Amount</th>
              <th>Note</th>
              ${payer ? '<th>Pay To</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
            <tr>
              <td colspan="2" class="total" style="padding:8px;border:1px solid #ddd;">Total Collection Required</td>
              <td class="total" style="padding:8px;border:1px solid #ddd;text-align:right;">₹${collectionTotal.toFixed(2)}</td>
              <td></td>
              ${payer ? '<td></td>' : ''}
            </tr>
          </tbody>
        </table>
        <div class="muted" style="margin-top:8px;">Generated by United77 Cricket Fees Manager</div>
        <button onclick="window.print()" style="margin-top:16px;padding:8px 12px;">Print / Save as PDF</button>
      </body>
    </html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
    }

    const newPDF: PDFHistory = {
      id: Date.now().toString(),
      matchId: currentMatch.id,
      filename,
      createdAt: new Date().toISOString(),
      opponentTeam: currentMatch.opponentTeam,
      totalFees: currentMatch.totalFees,
      matchData: {
        date: currentMatch.date,
        selectedPlayers: currentMatch.selectedPlayers,
        feeSplit: currentMatch.feeSplit,
        payments: currentMatch.payments,
      },
    };
    setPdfHistory(prev => [newPDF, ...prev]);
  };

  const handleShareWhatsApp = () => {
    if (currentMatch) {
      const message = `United77 Match Fees vs ${currentMatch.opponentTeam}\n\nTotal Fees: Rs.${currentMatch.totalFees}\nPlayers: ${currentMatch.feeSplit.totalPlayers}\n\nPer player: Rs.${currentMatch.feeSplit.perPlayerAmount.toFixed(2)}\n\nCore members pay extra Rs.${currentMatch.feeSplit.coreShareExtra.toFixed(2)} each to cover unpaid players.\n\nGenerated by United77 Cricket Fee Manager`;
      
      if (navigator.share) {
        navigator.share({
          title: `United77 vs ${currentMatch.opponentTeam} - Fee Split`,
          text: message,
        });
      } else {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    }
  };

  const handleNavigate = (tab: string) => {
    if (tab !== activeTab) {
      setNavigationHistory(prev => [...prev, tab]);
    }
    setActiveTab(tab);
    // Update URL without page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  const handleBack = () => {
    // Delegate back navigation to the browser so URL and stack stay consistent
    if (navigationHistory.length > 1) {
      window.history.back();
    }
  };

  const canGoBack = navigationHistory.length > 1;
  
  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'home': return 'United77';
      case 'team': return 'Team Management';
      case 'calculate': return 'Calculate Fees';
      case 'calculate-result': return 'Fee Split Results';
      case 'history': return 'PDF History';
      case 'settings': return 'Settings';
      default: return 'United77';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            playerCount={players.filter(p => p.isActive).length}
            recentMatches={pdfHistory.length}
            onNavigate={handleNavigate}
          />
        );
      
      case 'team':
        return (
          <TeamPage
            players={players}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onWhatsAppPlayer={handleWhatsAppPlayer}
          />
        );
      
      case 'calculate':
        return (
          <MatchSetup
            players={players}
            onCalculateFees={handleCalculateFees}
          />
        );
      
      case 'calculate-result':
        return currentMatch ? (
          <FeeSplitDisplay
            match={currentMatch}
            players={players}
            onGeneratePDF={handleGeneratePDF}
            onShareWhatsApp={handleShareWhatsApp}
            onUpdatePlayer={handleUpdatePlayer}
          />
        ) : (
          <MatchSetup
            players={players}
            onCalculateFees={handleCalculateFees}
          />
        );
      
      case 'history':
        return (
          <PDFHistoryPage
            pdfHistory={pdfHistory}
            players={players}
            onDownloadPDF={(pdf) => console.log('Download:', pdf.filename)}
            onSharePDF={(pdf) => console.log('Share:', pdf.filename)}
            onViewPDF={(pdf) => console.log('View:', pdf.filename)}
          />
        );
      
      case 'settings':
        return (
          <SettingsPage
            isDarkMode={false} // This would come from theme context
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={setNotificationsEnabled}
          />
        );
      
      default:
        return (
          <HomePage
            playerCount={players.filter(p => p.isActive).length}
            recentMatches={pdfHistory.length}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            {/* Offline Indicator */}
            <OfflineIndicator />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  {canGoBack && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBack}
                      className="mr-2"
                      data-testid="button-back"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <div className="text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2v6h.01L8.5 10 7 22l5-5.5L17 22l-1.5-12L18 8h.01V2H6z"/>
                      <path d="M8.5 10L16 8"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold" data-testid="header-title">
                      {getPageTitle(activeTab)}
                    </h1>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 max-w-2xl">
              {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation
              activeTab={activeTab === 'calculate-result' ? 'calculate' : activeTab}
              onTabChange={handleNavigate}
              playerCount={players.filter(p => p.isActive).length}
              pdfCount={pdfHistory.length}
            />

            {/* PWA Install Prompt */}
            <InstallPrompt />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;