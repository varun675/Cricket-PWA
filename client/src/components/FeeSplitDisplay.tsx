import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Download, Share, IndianRupee, Users } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Match, Player } from "@shared/schema";

interface FeeSplitDisplayProps {
  match: Match;
  players: Player[];
  onGeneratePDF?: (payerId?: string) => void;
  onShareWhatsApp?: () => void;
  onUpdatePlayer?: (id: string, updates: Partial<Player>) => void;
}

export default function FeeSplitDisplay({ match, players, onGeneratePDF, onShareWhatsApp, onUpdatePlayer }: FeeSplitDisplayProps) {
  const getPlayerById = (id: string) => players.find(p => p.id === id);
  const [payerId, setPayerId] = useState<string | null>(null);
  
  const corePayments = match.payments.filter(p => {
    const player = getPlayerById(p.playerId);
    return player?.category === 'core';
  });
  
  const selfPaidPayments = match.payments.filter(p => {
    const player = getPlayerById(p.playerId);
    return player?.category === 'self_paid';
  });
  
  const unpaidPayments = match.payments.filter(p => {
    const player = getPlayerById(p.playerId);
    return player?.category === 'unpaid';
  });

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const payer = payerId ? getPlayerById(payerId) : undefined;
  const payerPayment = payerId ? match.payments.find(p => p.playerId === payerId) : undefined;
  const payerReturn = payer && payerPayment ? (match.totalFees - payerPayment.amount) : 0;

  const getAmountDueForPlayer = (playerId: string) => {
    const payment = match.payments.find(p => p.playerId === playerId);
    const player = getPlayerById(playerId);
    if (!payment || !player) return 0;
    if (player.category === 'unpaid') return 0;
    return payment.amount;
  };

  const sendWhatsAppTo = (playerId: string) => {
    const player = getPlayerById(playerId);
    if (!player?.phone) return;
    const amountDue = getAmountDueForPlayer(playerId);
    let message = `Hi ${player.name}!\n\n`;
    message += `United77 vs ${match.opponentTeam}\n`;
    message += `Date: ${match.date}\n`;
    message += `Total Match Fees: ₹${match.totalFees.toFixed(2)}\n\n`;

    if (player.category === 'unpaid') {
      message += `Your fees are covered by our core members. No payment needed.\n`;
    } else if (payer && player.id !== payerId) {
      const payerPhone = payer.phone ? ` (${payer.phone})` : '';
      message += `Please pay ₹${amountDue.toFixed(2)} to ${payer.name}${payerPhone}.\n`;
      // Add UPI deep links if payer has UPI ID
      if (payer.upiId && amountDue > 0) {
        const pn = encodeURIComponent(payer.name);
        const am = encodeURIComponent(amountDue.toFixed(2));
        const pa = encodeURIComponent(payer.upiId);
        const upiLink = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR`;
        // Some apps parse generic UPI URIs; still label for clarity
        message += `\nQuick payment links:\n`;
        message += `Google Pay: ${upiLink}\n`;
        message += `PhonePe: ${upiLink}\n`;
      }
    } else if (payer && player.id === payerId) {
      message += `You are collecting payments for this match. Your share is ₹${amountDue.toFixed(2)}.\n`;
      if (payerReturn > 0) {
        message += `You should receive back a total of ₹${payerReturn.toFixed(2)} after collections.\n`;
      }
    } else {
      message += `Your share is ₹${amountDue.toFixed(2)}.\n`;
    }

    message += `\nThanks! - United77 Team`;
    const waUrl = `https://wa.me/${player.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <Card data-testid="card-fee-split">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Fee Split Calculation
          </CardTitle>
          <div className="flex gap-2">
            {onGeneratePDF && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onGeneratePDF(payerId || undefined)}
                className="gap-2"
                data-testid="button-generate-pdf"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            )}
            {onShareWhatsApp && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onShareWhatsApp}
                className="gap-2 text-green-600"
                data-testid="button-share-whatsapp"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Match Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Opponent:</span>
              <p className="font-medium" data-testid="text-opponent">{match.opponentTeam}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Fees:</span>
              <p className="font-medium" data-testid="text-total-fees">{formatCurrency(match.totalFees)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Players:</span>
              <p className="font-medium" data-testid="text-total-players">{match.feeSplit.totalPlayers}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Per Player:</span>
              <p className="font-medium" data-testid="text-per-player">{formatCurrency(match.feeSplit.perPlayerAmount)}</p>
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Payment Breakdown
          </h3>
          
          {/* Core Members */}
          {corePayments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">Core Members</Badge>
                <span className="text-sm text-muted-foreground">
                  (Pay extra ₹{match.feeSplit.coreShareExtra.toFixed(2)} each for unpaid players)
                </span>
              </div>
              <div className="space-y-1">
                {corePayments.map((payment) => {
                  const player = getPlayerById(payment.playerId);
                  return (
                    <div 
                      key={payment.playerId} 
                      className="flex justify-between items-center p-2 bg-muted/30 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        const willSelect = payerId !== payment.playerId;
                        setPayerId(willSelect ? payment.playerId : null);
                        if (willSelect) {
                          const selected = player; // current row's core player
                          if (selected && !selected.upiId) {
                            const entered = window.prompt(`Enter UPI ID for ${selected.name} (e.g., name@bank) to include quick payment links in WhatsApp`);
                            if (entered && entered.trim().length > 0) {
                              onUpdatePlayer?.(selected.id, { upiId: entered.trim() });
                            }
                          }
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={payerId === payment.playerId}
                          onCheckedChange={(checked) => {
                            const willSelect = Boolean(checked);
                            setPayerId(willSelect ? payment.playerId : null);
                            if (willSelect) {
                              const selected = player; // current row's core player
                              if (selected && !selected.upiId) {
                                const entered = window.prompt(`Enter UPI ID for ${selected.name} (e.g., name@bank) to include quick payment links in WhatsApp`);
                                if (entered && entered.trim().length > 0) {
                                  onUpdatePlayer?.(selected.id, { upiId: entered.trim() });
                                }
                              }
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Paid by"
                        />
                        <div>
                          <span className="font-medium" data-testid={`text-core-player-${payment.playerId}`}>
                            {player?.name}
                          </span>
                          {player?.phone && (
                            <div className="text-xs text-muted-foreground">{player.phone}</div>
                          )}
                        </div>
                        {payerId === payment.playerId && (
                          <Badge variant="secondary" className="text-xs">Paid by</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {player?.phone && (
                          <Button size="icon" variant="ghost" aria-label="WhatsApp"
                            onClick={() => sendWhatsAppTo(payment.playerId)}
                          >
                            <FaWhatsapp className="h-5 w-5 text-green-600" />
                          </Button>
                        )}
                        <div className="text-right">
                          <span className="block font-bold text-primary" data-testid={`text-core-amount-${payment.playerId}`}>
                            {formatCurrency(payment.amount)}
                          </span>
                          {payerId && payerId !== payment.playerId && payer && (
                            <span className="block text-xs text-muted-foreground">Pay to {payer.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Self Paid Players */}
          {selfPaidPayments.length > 0 && (
            <div className="space-y-2">
              <Badge className="bg-chart-2 text-primary-foreground">Self Paid Players</Badge>
              <div className="space-y-1">
                {selfPaidPayments.map((payment) => {
                  const player = getPlayerById(payment.playerId);
                  return (
                    <div key={payment.playerId} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <div>
                        <span className="font-medium" data-testid={`text-self-paid-player-${payment.playerId}`}>
                          {player?.name}
                        </span>
                        {player?.phone && (
                          <div className="text-xs text-muted-foreground">{player.phone}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {player?.phone && (
                          <Button size="icon" variant="ghost" aria-label="WhatsApp"
                            onClick={() => sendWhatsAppTo(payment.playerId)}
                          >
                            <FaWhatsapp className="h-5 w-5 text-green-600" />
                          </Button>
                        )}
                        <div className="text-right">
                          <span className="block font-bold" data-testid={`text-self-paid-amount-${payment.playerId}`}>
                            {formatCurrency(payment.amount)}
                          </span>
                          {payer && (
                            <span className="block text-xs text-muted-foreground">Pay to {payer.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unpaid Players */}
          {unpaidPayments.length > 0 && (
            <div className="space-y-2">
              <Badge className="bg-chart-3 text-primary-foreground">Unpaid Players</Badge>
              <div className="space-y-1">
                {unpaidPayments.map((payment) => {
                  const player = getPlayerById(payment.playerId);
                  return (
                    <div key={payment.playerId} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <div>
                        <span className="font-medium" data-testid={`text-unpaid-player-${payment.playerId}`}>
                          {player?.name}
                        </span>
                        {player?.phone && (
                          <div className="text-xs text-muted-foreground">{player.phone}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block text-muted-foreground" data-testid={`text-unpaid-amount-${payment.playerId}`}>
                            {formatCurrency(payment.amount)} (covered by core)
                          </span>
                          {payer && (
                            <span className="block text-xs text-muted-foreground">Pay to {payer.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Payer Summary */}
        {payer && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Paid by</h4>
                <p className="text-sm text-muted-foreground">All players should pay their share to {payer.name}.</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">To be returned</div>
                <div className="text-lg font-bold" data-testid="text-payer-return">
                  {formatCurrency(payerReturn)}
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />
        
        {/* Total Summary */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Collection Required:</span>
            <span className="text-primary" data-testid="text-collection-total">
              {formatCurrency(corePayments.reduce((sum, p) => sum + p.amount, 0) + selfPaidPayments.reduce((sum, p) => sum + p.amount, 0))}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Core members cover {formatCurrency(unpaidPayments.reduce((sum, p) => sum + p.amount, 0))} for unpaid players
          </div>
        </div>
      </CardContent>
    </Card>
  );
}