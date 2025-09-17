import { z } from "zod";

// Player categories for fee splitting logic
export const PlayerCategory = {
  CORE: 'core',
  SELF_PAID: 'self_paid', 
  UNPAID: 'unpaid'
} as const;

export type PlayerCategoryType = typeof PlayerCategory[keyof typeof PlayerCategory];

// Player schema
export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  upiId: z.string().optional(),
  category: z.enum([PlayerCategory.CORE, PlayerCategory.SELF_PAID, PlayerCategory.UNPAID]),
  isActive: z.boolean().default(true),
});

export const insertPlayerSchema = playerSchema.omit({ id: true });

export type Player = z.infer<typeof playerSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

// Match schema
export const matchSchema = z.object({
  id: z.string(),
  opponentTeam: z.string().min(1, "Opponent team is required"),
  totalFees: z.number().min(0, "Total fees must be positive"),
  date: z.string(), // ISO date string
  selectedPlayers: z.array(z.string()), // player IDs
  feeSplit: z.object({
    perPlayerAmount: z.number(),
    coreShareExtra: z.number(),
    totalPlayers: z.number(),
    corePlayers: z.number(),
    selfPaidPlayers: z.number(), 
    unpaidPlayers: z.number(),
  }),
  payments: z.array(z.object({
    playerId: z.string(),
    amount: z.number(),
    paid: z.boolean(),
    paidBy: z.string().optional(), // ID of player who paid for unpaid players
  })),
  createdAt: z.string(),
});

export const insertMatchSchema = matchSchema.omit({ id: true, createdAt: true });

export type Match = z.infer<typeof matchSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// PDF History schema
export const pdfHistorySchema = z.object({
  id: z.string(),
  matchId: z.string(),
  filename: z.string(),
  createdAt: z.string(),
  opponentTeam: z.string(),
  totalFees: z.number(),
  matchData: z.object({
    date: z.string(),
    selectedPlayers: z.array(z.string()),
    feeSplit: z.object({
      perPlayerAmount: z.number(),
      coreShareExtra: z.number(),
      totalPlayers: z.number(),
      corePlayers: z.number(),
      selfPaidPlayers: z.number(),
      unpaidPlayers: z.number(),
    }),
    payments: z.array(z.object({
      playerId: z.string(),
      amount: z.number(),
      paid: z.boolean(),
      paidBy: z.string().optional(),
    })),
  }).optional(),
});

export type PDFHistory = z.infer<typeof pdfHistorySchema>;
