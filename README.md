# 🎮 FlogIt Arena: Gamified Marketplace Platform

Welcome to **FlogIt Arena**, an evolution of the original FlogIt auction platform transformed into a fully gamified marketplace experience. This demo project showcases modern development practices with a comprehensive gamification layer featuring virtual currency, progression systems, and engaging user experiences.

❗❗ This is a demo project using **fake FLOG currency** for educational purposes only. No real money is involved. The platform is currently desktop-optimized. ❗❗

## ✨ Core Functionalities

### Marketplace Features
- **Real-time Trading**: Buy and sell items instantly using FLOG cryptocurrency
- **User Authentication**: Secure registration and login via Duende Identity Service
- **Live Notifications**: Real-time alerts for marketplace activities and achievements
- **Item Rarity System**: 5-tier rarity classification (Common → Legendary)

### Gamification Features
- **FLOG Wallet**: Virtual cryptocurrency system with staking capabilities
- **XP & Leveling**: 50-level progression system with dynamic XP requirements
- **Title System**: 7 prestigious titles from "Novice Trader" to "Trading Legend"
- **Daily Quests**: 4 rotating daily quests with FLOG and XP rewards
- **Achievements**: 12 unlockable achievements across 4 rarity tiers
- **Mystery Boxes**: 3-tier loot box system (Bronze/Silver/Gold) with guaranteed rarities
- **Leaderboards**: Global rankings by level, FLOG balance, and achievements
- **Activity Feed**: Live marketplace event tracking
- **Login Streaks**: Daily login rewards to encourage engagement

## 🎯 Gamification System Details

### FLOG Economy
- **Starting Balance**: 1,000 FLOG
- **Earning Methods**: Quest rewards, achievement unlocks, item sales, daily bonuses, mystery boxes
- **Spending Options**: Item purchases, mystery boxes, staking
- **Marketplace Fee**: 5% on all sales
- **Transaction Types**: Purchase, Sale, Quest Reward, Achievement Reward, Daily Bonus, Mystery Box, Staking, Unstaking, Ad Reward

### Progression System
- **Level Range**: 1-50
- **XP Formula**: Base 100 + (Level × 50) per level
- **XP Sources**:
  - Marketplace purchases: +50 XP
  - Item sales: +100 XP
  - Quest completion: 10-50 XP
  - Achievement unlocks: 10-100 XP
  - Mystery box opening: Bonus XP

### Title Progression
1. **Novice Trader** (Level 1-4)
2. **Apprentice Merchant** (Level 5-9)
3. **Skilled Vendor** (Level 10-19)
4. **Expert Trader** (Level 20-29)
5. **Master Merchant** (Level 30-39)
6. **Elite Dealer** (Level 40-49)
7. **Trading Legend** (Level 50)

### Quest System
Daily rotating quests with automatic progress tracking:
- **Daily Login**: 50 FLOG, 10 XP
- **Market Explorer**: Browse 10 items - 100 FLOG, 25 XP
- **First Purchase**: Complete any purchase - 200 FLOG, 50 XP
- **Active Seller**: List 3 items - 150 FLOG, 30 XP

### Achievement Categories
- **Trading Achievements**: First purchase, sales milestones
- **Collection Achievements**: Rare item collection goals
- **Milestone Achievements**: Level and FLOG balance targets
- **Social Achievements**: Community engagement metrics

### Mystery Box System
| Tier | Cost | Rarity Chances | Guaranteed |
|------|------|----------------|------------|
| Bronze | 100 FLOG | 70% Common, 25% Uncommon, 5% Rare | None |
| Silver | 500 FLOG | 50% Uncommon, 30% Rare, 15% Epic, 5% Legendary | Uncommon+ |
| Gold | 1,500 FLOG | 20% Rare, 35% Epic, 30% Legendary, 15% Mythic | Rare+ |

### Item Rarity Tiers
1. **Common** (70% drop rate) - Gray border, standard rewards
2. **Uncommon** (20% drop rate) - Green border, 1.5× value
3. **Rare** (8% drop rate) - Blue border, 2× value
4. **Epic** (1.8% drop rate) - Purple border, 3× value
5. **Legendary** (0.2% drop rate) - Orange/Gold border, 5× value with shimmer effect

## 🛠️ Technical Stack & Architecture

<p align="center">
  <img src="https://img.shields.io/badge/C%23-239120?style=flat&logo=c-sharp&logoColor=white" alt="C#">
  <img src="https://img.shields.io/badge/.NET%207-512BD4?style=flat&logo=dot-net&logoColor=white" alt=".NET">
  <img src="https://img.shields.io/badge/next%20js-000000?style=flat&logo=nextdotjs&logoColor=white" alt="NextJS">
  <img src="https://img.shields.io/badge/react%2018-61DAFB?style=flat&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white" alt="RabbitMQ">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white" alt="Kubernetes">
  <img src="https://img.shields.io/badge/Zustand-000000?style=flat&logo=react&logoColor=white" alt="Zustand">
</p>

### Frontend Technologies
- **Framework**: Next.js 13.4.19 with App Router
- **UI Library**: React 18.2.0 with TypeScript
- **Styling**: TailwindCSS 3.3.3 for responsive design
- **State Management**: Zustand 4.4.1 for gamification state
- **Real-time**: SignalR client for live updates
- **Forms**: React Hook Form for user input
- **Notifications**: React Hot Toast for user feedback
- **Icons**: React Icons for comprehensive icon set

### Backend Technologies
- **Framework**: ASP.NET Core 7/8
- **ORM**: Entity Framework Core with PostgreSQL
- **Authentication**: Duende IdentityServer
- **Messaging**: MassTransit + RabbitMQ for event-driven architecture
- **Real-time**: SignalR for WebSocket connections
- **Containerization**: Docker with Kubernetes orchestration

### Database Architecture
- **PostgreSQL**: Relational data (users, wallets, transactions, gamification)
- **MongoDB**: NoSQL storage for flexible item metadata and activity logs

## 🔧 Backend Microservices

### GamificationService (NEW)
- **Framework**: ASP.NET Core 7/8
- **Database**: PostgreSQL
- **Functionality**:
  - FLOG wallet management and transaction processing
  - XP calculation and level progression
  - Quest generation and completion tracking
  - Achievement unlocking and rewards
  - Mystery box loot generation
  - Activity feed event publishing
  - Leaderboard rankings

**Entities**: UserWallet, Transaction, UserGamification, Quest, QuestProgress, Achievement, UserAchievement, MysteryBox, ActivityFeed, DemoSettings

**Services**: WalletService, TransactionService, UserGamificationService, QuestService, AchievementService, MysteryBoxService, ActivityFeedService

**API Endpoints**: 23 RESTful endpoints across 5 controllers

### Auction Service
- **Framework**: ASP.NET Core
- **Functionality**: Auction lifecycle management, RabbitMQ integration for event publishing

### Bidding Service
- **Framework**: ASP.NET Core
- **Functionality**: Real-time bid processing, gRPC communication with Auction Service

### Gateway Service
- **Framework**: ASP.NET Core
- **Functionality**: API gateway for request routing and load balancing

### Identity Service
- **Framework**: Duende IdentityServer
- **Functionality**: JWT-based authentication and authorization

### Notification Service
- **Framework**: ASP.NET Core + SignalR
- **Functionality**: Real-time push notifications via WebSockets

### Search Service
- **Framework**: ASP.NET Core
- **Functionality**: Optimized item search with MongoDB indexing

## 🎨 Frontend Components

### Gamification Components
- **FlogWallet**: Comprehensive wallet display with balance, staking, earnings, and exchange rates
- **LevelProgress**: XP progress bar with level and title display (compact and full views)
- **QuestTracker**: Daily quest list with progress tracking and reward claiming
- **AchievementUnlock**: Animated achievement notification popup
- **Leaderboard**: Tabbed rankings by level, FLOG, and achievements
- **ActivityFeed**: Live marketplace event stream with auto-refresh
- **RarityBadge**: Reusable rarity indicator with glow effects
- **RarityBorder**: Item wrapper with rarity-based borders and shimmer
- **MysteryBox**: Interactive box opening with reveal animation

### State Management
- **useWalletStore**: FLOG balance, transactions, staking state
- **useGamificationStore**: XP, level, quests, achievements, notifications

## 🚀 Event-Driven Architecture

The gamification system integrates with the marketplace via RabbitMQ events:

**Published Events**:
- `UserLeveledUp` - Triggers when user reaches new level
- `AchievementUnlocked` - Fires on achievement completion
- `QuestCompleted` - Emitted when quest requirements met
- `PurchaseCompleted` - Marketplace purchase processed
- `ItemListed` - New item added to marketplace
- `MysteryBoxOpened` - Loot box rewards distributed

**Consumed Events**:
- Marketplace purchases trigger quest progress and XP rewards
- Item listings update collection achievements
- User registrations initialize wallets and gamification profiles

## 🗄️ Database Schema Highlights

### GamificationService PostgreSQL Schema

**UserWallets**
- FlogBalance (starting: 1000)
- FlogStaked
- TotalEarned
- TotalSpent
- Exchange rates (GBP, USD, EUR)

**Transactions**
- UserId, Amount, Type
- Description, Metadata
- Timestamps

**UserGamifications**
- Level, XP, Title
- StreakDays, LastLogin
- AchievementCount, CompletedQuestsCount

**Quests**
- Name, Description, Type
- TargetCount, FlogReward, XpReward
- ExpiresAt

**QuestProgress**
- UserId, QuestId
- Progress, Completed, Claimed

**Achievements**
- Name, Description, Category, Rarity
- Requirement, FlogReward, XpReward

**UserAchievements**
- UserId, AchievementId
- UnlockedAt

**MysteryBoxes**
- Tier (Bronze/Silver/Gold)
- Cost, RarityChances
- LootTables

**ActivityFeed**
- UserId, ActivityType
- Description, Metadata
- Timestamp

## 🔄 GitHub CI/CD Integration

Automated GitHub Actions workflows handle:
- Unit and integration testing
- Docker image building and versioning
- Kubernetes deployment manifests
- Database migrations
- Code quality checks

## 📊 Key Metrics & Demo Settings

The gamification system uses the following configuration:
- Starting FLOG Balance: 1,000
- Marketplace Fee: 5%
- Base XP per Level: 100
- XP Increment per Level: 50
- Maximum Level: 50
- Purchase XP Reward: 50
- Sale XP Reward: 100

## 🐍 Bot Service Integration

The enhanced bot service simulates marketplace activity:
- Creates realistic item listings with randomized rarities
- Places bids on active auctions
- Triggers gamification events for testing
- Generates activity feed content
- Demonstrates quest completion flows

## 🎮 Getting Started

### Prerequisites
- .NET 7/8 SDK
- Node.js 18+
- Docker Desktop
- Kubernetes (minikube or Docker Desktop)
- PostgreSQL
- MongoDB
- RabbitMQ

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/reneupton/FlogIt-Arena.git
cd FlogIt-Arena
```

2. **Start infrastructure services**
```bash
docker-compose up -d postgres mongodb rabbitmq
```

3. **Run backend services**
```bash
cd src/GamificationService
dotnet restore
dotnet ef database update
dotnet run
```

4. **Run frontend**
```bash
cd frontend/webapp
npm install
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- GamificationService: http://localhost:7004
- Identity Server: http://localhost:5000

## 🧪 Testing

The project includes comprehensive test coverage:
- Unit tests for service logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Load testing for concurrent users

## 🔐 Security Considerations

- All FLOG transactions are demo currency only
- JWT authentication with refresh token rotation
- Input validation and sanitization
- CORS policies configured for production
- Rate limiting on API endpoints
- SQL injection prevention via parameterized queries

## 📝 License

This is a demonstration project for portfolio purposes. All code is provided as-is for educational reference.

## 🙏 Acknowledgments

Built to showcase modern full-stack development practices including:
- Microservices architecture
- Event-driven design patterns
- Clean architecture principles
- Responsive UI/UX design
- Comprehensive state management
- Real-time data synchronization
- Gamification psychology
- Virtual economy design

---

**Note**: This platform uses fictional FLOG currency and is intended solely for demonstration purposes. No real monetary value is involved.
