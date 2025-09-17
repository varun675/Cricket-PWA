# United77 Cricket Fee Manager PWA

A Progressive Web App for splitting cricket match fees among team members with smart payment tracking and WhatsApp integration.

## 🏏 Features

- **Fee Calculation**: Split match fees among core, self-paid, and unpaid players
- **Team Management**: Add and manage team players with categories
- **Payment Tracking**: Track who pays what with UPI integration
- **WhatsApp Integration**: Send payment reminders with UPI links
- **PDF Generation**: Create and download match fee reports
- **PWA Features**: Install on device, works offline, native app experience

## 🚀 Live Demo

Visit the live PWA: [https://yourusername.github.io/CrossMobile/](https://yourusername.github.io/CrossMobile/)

## 📱 Installation

### As a PWA (Recommended)
1. Visit the live demo link
2. Click "Install" when prompted, or
3. Use browser menu → "Install app" or "Add to Home Screen"

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/CrossMobile.git
cd CrossMobile

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:client
```

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI
- **PWA**: Service Worker + Web App Manifest
- **Icons**: Lucide React + React Icons
- **State**: React Hooks + Local Storage
- **Build**: Vite + GitHub Actions

## 📦 Deployment

This PWA is automatically deployed to GitHub Pages using GitHub Actions.

### Deploy to Your Own GitHub Pages

1. **Fork this repository**
2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
3. **Update configuration**:
   - Edit `vite.config.ts`: Change `/CrossMobile/` to `/your-repo-name/`
   - Edit `.github/workflows/deploy.yml` if needed
4. **Push to main branch** - deployment happens automatically!

### Manual Deployment

```bash
# Build the PWA
npm run build:client

# Deploy the dist/public folder to your hosting provider
```

## 🎯 PWA Features

- ✅ **Installable**: Add to home screen on any device
- ✅ **Offline Ready**: Core features work without internet
- ✅ **Fast Loading**: Service worker caching
- ✅ **Native Feel**: Standalone display mode
- ✅ **Responsive**: Works on mobile, tablet, and desktop
- ✅ **Secure**: HTTPS required for PWA features

## 📱 Usage

1. **Team Setup**: Add players and categorize them (Core/Self-paid/Unpaid)
2. **Calculate Fees**: Select players for a match and enter total fees
3. **Payment Tracking**: Use "Paid by" feature for one core member to collect
4. **WhatsApp Integration**: Send payment reminders with UPI links
5. **PDF Reports**: Generate and share match fee breakdowns

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Set to 'production' for GitHub Pages build
- `VITE_BASE_URL`: Base URL for the app (auto-configured)

### Customization
- **Team Name**: Update in `manifest.json` and throughout the app
- **Colors**: Modify theme colors in `tailwind.config.ts`
- **Icons**: Replace SVG icons in `manifest.json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏏 About United77

This app was built for the United77 cricket team to simplify fee splitting and payment tracking. It can be easily customized for any cricket team or sports group.

---

**Made with ❤️ for cricket teams everywhere** 🏏
