# WHIX: Gig Economy Dystopia

A cyberpunk-themed game where neurodivergent traits are superpowers in a dystopian gig economy. Fight against corporate exploitation while managing a team of unique partners in Polanco.

🎮 **Play Now:** [whix-game.vercel.app](https://whix-game.vercel.app)

## 🌟 Features

- **Neurodivergent-Positive Gameplay**: Traits like hyperfocus, pattern recognition, and enhanced senses become gameplay advantages
- **Partner System**: Recruit unique partners through a gacha system with pity mechanics
- **Humanity Index**: Your choices affect the world and story outcomes
- **Visual Novel Storytelling**: Rich narrative with branching dialogue paths
- **Turn-Based Combat**: Strategic 5x5 grid battles utilizing partner abilities
- **Mission System**: Daily missions, weekly challenges, and special events
- **Cyberpunk Aesthetic**: Neon-soaked UI with glitch effects and pixel art

## 🎯 Game Concept

In the year 2045, the gig economy has consumed everything. WHIX, the monopolistic delivery app, controls Polanco with an iron algorithm. But in this dystopia, those society calls "different" have found their edge. Their neurodivergent traits aren't disabilities—they're the keys to breaking the system.

Play as a rebel coordinator, recruiting partners and managing deliveries while secretly building a resistance. Every choice matters, every partner is unique, and the algorithm is always watching.

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme system
- **State Management**: Zustand with Immer
- **Database**: PostgreSQL with Drizzle ORM
- **Game Engine**: Pixi.js for combat visualization
- **Animation**: Framer Motion
- **Testing**: Vitest with React Testing Library
- **Payment**: Stripe integration for monetization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon/Supabase account)
- Stripe account (for payment features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whix-game.git
cd whix-game
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your database and Stripe credentials:
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start playing!

## 🎮 How to Play

1. **Start Your Journey**: Create your character and meet your first partner
2. **Accept Missions**: Choose from daily deliveries and special assignments
3. **Manage Resources**: Balance tips earned vs. WHIX's cut
4. **Recruit Partners**: Use the gacha system to build your team
5. **Make Choices**: Your decisions affect your Humanity Index and story progression
6. **Fight the System**: Engage in turn-based combat against corporate enforcers
7. **Build the Resistance**: Unlock story chapters and discover the truth about WHIX

## 🧪 Testing

Run the test suite:
```bash
npm run test        # Run tests once
npm run test:watch  # Run tests in watch mode
npm run test:ui     # Open Vitest UI
```

## 🐳 Docker Support

Run the game in Docker:
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.yml up
```

## 📝 Content Management

The game uses a markdown-based CMS for managing:
- Story chapters and dialogue
- Character profiles and backstories
- Mission descriptions
- Item and ability descriptions

Content files are located in the `/content` directory.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the neurodivergent community and their unique strengths
- Built with love for cyberpunk aesthetics and narrative games
- Special thanks to all contributors and playtesters

---

**Remember**: In Polanco, being different isn't a bug—it's a feature. 🌆✊