# VictoryOps - AI-Powered Political Campaign Management

VictoryOps is a comprehensive platform for managing political campaigns from filing to victory. Built with React, TypeScript, Vite, Supabase, and Google Gemini AI.

## Features

- 🎯 **Intelligence Module**: 10 research modes (Economic, Sentiment, Policy, Opposition, Media, etc.)
- 🖼️ **Darkroom**: AI image generation for campaign assets
- 📢 **Megaphone**: AI-powered message generation
- 💰 **War Chest**: Budget tracking and donor pipeline
- ⚖️ **Legal Shield**: Compliance tracking and disclaimer generation
- 🧬 **DNA Vault**: Candidate profile and master narrative synthesis
- 👥 **Opposition Research**: AI-powered vulnerability scanning

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build**: Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Google Gemini 2.0 Flash
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google AI API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/victoryops.git
cd victoryops
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your credentials
\`\`\`

4. Run development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open browser to `http://localhost:5173`

## Database Setup

See [SETUP.md](./docs/SETUP.md) for detailed Supabase configuration.

Quick migration:
\`\`\`bash
# Run supabase/migrations/20260120_initial_schema.sql in Supabase SQL Editor
\`\`\`

## Deployment

Deploy to Vercel:
\`\`\`bash
npm run build
vercel --prod
\`\`\`

## License

Proprietary - All Rights Reserved

## Contact

For inquiries: contact@victoryops.com
\`\`\`

---

### **6. vite.config.ts** (IF NOT EXISTS)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deploy**

- [ ] Run `npm install` to ensure all dependencies installed
- [ ] Test locally with `npm run dev`
- [ ] Verify Supabase connection works
- [ ] Check all 8 modules render without errors
- [ ] Test authentication flow
- [ ] Verify image upload to Supabase Storage works

### **GitHub Setup**

- [ ] Create GitHub repository
- [ ] Add all files from structure above
- [ ] Commit initial code: `git add . && git commit -m "Initial commit"`
- [ ] Push to GitHub: `git push -u origin main`

### **Vercel Deployment**

- [ ] Connect GitHub repo to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy: Vercel auto-deploys on push
- [ ] Update Supabase Site URL to production domain
- [ ] Test production deployment

---

## ⏱️ **TIMELINE ESTIMATE**

- **Supabase Setup**: 30 minutes
- **Code Migration**: 1 hour (add Supabase integration)
- **GitHub Setup**: 15 minutes
- **Vercel Deployment**: 30 minutes
- **Testing**: 1 hour

**Total: ~3.5 hours to production**

---

## 🎯 **NEXT STEPS AFTER DEPLOYMENT**

1. **Week 1**: Beta testing with 5-10 campaigns
2. **Week 2**: Implement Stripe payment system
3. **Week 3**: Add voter file integration
4. **Week 4**: Launch marketing campaign for 2026 cycle

---

**Questions? Issues?** Open GitHub issue or contact support.
