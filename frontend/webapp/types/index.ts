export type PagedResult<T> = {
    results: T[]
    pageCount: number
    totalCount: number
}

  export type Auction = {
    reserve: number
    seller: string
    winner?: string
    soldAmount: number
    reservePrice: number
    currentHighBid: number
    createdAt: string
    updatedAt: string
    auctionEnd: string
    status: string
    title: string
    brand: string
    category: string
    variant: string
    condition: string
    colorway: string
    releaseYear?: number
    specs: string
    imageUrl: string
    id: string
  }

  export type Bid = {
    id: string
    auctionId: string
    bidder: string
    bidTime: string
    amount: number
    bidStatus: string
  }

  export type AuctionFinished = {
    itemSold: boolean
    auctionId: string
    winner?: string
    seller: string
    amount?: number
  }

  export type AuctionStatusChanged = {
    auctionId: string
    status: string
    changedBy?: string
    changedAt: string
  }

  export type UserAvatarUpdated = {
    username: string
    avatarUrl: string
    updatedBy?: string
    updatedAt: string
  }

  export type UserProgressAdjusted = {
    username: string
    balanceDelta?: number
    xpDelta?: number
    level?: number
    updatedBy?: string
    updatedAt: string
  }

  export type UserCooldownReset = {
    username: string
    updatedBy?: string
    updatedAt: string
  }

  export type PlayerProfile = {
    username: string
    avatarUrl: string
    level: number
    experience: number
    nextLevelAt: number
    flogBalance: number
    goldBalance?: number
    totalHeroPower?: number
    auctionsCreated: number
    auctionsSold: number
    auctionsWon: number
    bidsPlaced: number
    lastDailyReward?: string
    lastMysteryRewardAt?: string
    lastMysteryRewardXp?: number
    lastMysteryRewardCoins?: number
    recentPurchases?: string[]
    recentSales?: string[]
    heldBids?: { auctionId: string; amount: number }[]
    ownedHeroes?: OwnedHero[]
  }

  export type OwnedHero = {
    heroId: string
    variantId: string
    name: string
    discipline: string
    rarity: string
    strength: number
    intellect: number
    vitality: number
    agility: number
    cardImage?: string
    acquiredAt?: string
  }
