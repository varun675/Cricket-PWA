# Design Guidelines: United77 Cricket Fees Splitting PWA

## Design Approach
**Selected Approach**: Sports-focused design system with mobile-first utility approach
**Justification**: This is a utility-focused app for a specific cricket team, prioritizing functionality and quick data entry over visual flair.

## Core Design Elements

### A. Color Palette
**Primary Colors (Dark Mode):**
- Background: 17 15% 10% (rich dark charcoal)
- Surface: 17 15% 15% (elevated dark gray)
- Primary: 142 69% 45% (cricket green for actions)
- Text: 0 0% 92% (near white)

**Primary Colors (Light Mode):**
- Background: 0 0% 98% (off-white)
- Surface: 0 0% 100% (pure white)
- Primary: 142 69% 35% (deeper cricket green)
- Text: 17 15% 15% (dark charcoal)

**Accent Colors:**
- Success: 120 60% 50% (payment confirmed)
- Warning: 38 90% 55% (pending payments)
- Error: 0 65% 55% (overdue)

### B. Typography
- **Primary Font**: Inter (Google Fonts) - excellent mobile readability
- **Headers**: Font weight 600-700, sizes 24px-32px
- **Body Text**: Font weight 400-500, sizes 14px-16px
- **Small Text**: Font weight 400, size 12px for labels

### C. Layout System
**Tailwind Spacing Units**: Consistent use of 4, 6, 8, 12, 16 units
- Margins: m-4, m-6, m-8
- Padding: p-4, p-6, p-8
- Gaps: gap-4, gap-6
- Heights: h-12, h-16 for inputs and buttons

### D. Component Library

**Navigation:**
- Bottom tab navigation for main sections (Team, Calculate, History, Settings)
- Sticky header with app title and action buttons

**Forms:**
- Large touch-friendly inputs (minimum 44px height)
- Player category toggles with cricket-themed icons
- Number steppers for player counts
- Currency input with proper formatting

**Data Display:**
- Card-based layout for fee breakdowns
- Color-coded player status indicators
- Expandable sections for detailed calculations
- Payment status badges

**Actions:**
- Primary buttons: Rounded corners, cricket green background
- Secondary buttons: Outline style with cricket green border
- FAB for quick actions (Add Player, Calculate Fees)
- WhatsApp integration buttons with brand colors

**Mobile-Specific:**
- Swipe actions for player management
- Pull-to-refresh for data updates
- Modal overlays for detailed views
- Toast notifications for confirmations

### E. Animations
**Minimal Animation Approach:**
- Subtle slide transitions between screens (300ms ease-in-out)
- Loading states with cricket ball spin animation
- Success confirmations with gentle bounce
- No complex or distracting effects

## PWA-Specific Considerations

**Home Screen Icon**: Cricket bat and ball silhouette in cricket green
**Splash Screen**: Simple logo with cricket green background
**Navigation**: Native-like tab bar at bottom for thumb navigation
**Offline Indicator**: Subtle banner when offline with cached data notice

## Content Strategy

**Information Hierarchy:**
1. Current match fees calculation (primary focus)
2. Player management (secondary)
3. Payment tracking (tertiary)
4. History and exports (utility)

**Mobile Optimization:**
- Single-column layouts
- Large touch targets (minimum 44px)
- Thumb-friendly navigation zones
- Quick-access buttons for common actions

**Data Visualization:**
- Simple bar charts for fee distribution
- Color-coded player lists
- Clear payment status indicators
- Minimal but informative PDF previews

The design emphasizes quick data entry, clear fee calculations, and easy payment tracking while maintaining a professional appearance suitable for team coordination.