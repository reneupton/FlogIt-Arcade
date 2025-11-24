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

  export type PlayerProfile = {
    username: string
    avatarUrl: string
    level: number
    experience: number
    nextLevelAt: number
    flogBalance: number
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
  }
