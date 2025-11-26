import React, { useMemo, useState } from 'react'
import { Auction } from '@/types'
import Image from 'next/image'
import { CharacterDefinition } from '../data/characterCatalog'
import CountdownTimer from './CountdownTimer'
import goldIcon from '@/public/gold2.png'
import AnimatedHeroSprite from '../components/AnimatedHeroSprite'

type Props = {
  auction: Auction
  character: CharacterDefinition
  owned?: boolean
  onSelect: () => void
}

const rarityTone: Record<CharacterDefinition['rarity'], string> = {
  Common: 'bg-[rgba(255,255,255,0.08)] text-[var(--text)] border-[var(--card-border)]',
  Rare: 'bg-gradient-to-r from-[rgba(59,130,246,0.25)] to-[rgba(56,189,248,0.18)] text-[var(--text)] border-[rgba(59,130,246,0.6)]',
  Epic: 'bg-gradient-to-r from-[rgba(139,92,246,0.3)] to-[rgba(236,72,153,0.2)] text-[var(--text)] border-[rgba(139,92,246,0.6)]',
  Legendary: 'bg-gradient-to-r from-[rgba(245,158,11,0.35)] to-[rgba(249,115,22,0.25)] text-[var(--text)] border-[rgba(245,158,11,0.65)]',
};

export default function AuctionCard({ auction, character, owned, onSelect }: Props) {
  const ownership = owned ? 'Owned' : undefined;
  const [hovered, setHovered] = useState(false);

  const basePath = useMemo(() => {
    const match = character.cardImage.match(/(.*)\/card\/frame_\d+\.png$/);
    return match ? match[1] : '';
  }, [character.cardImage]);

  return (
    <button
      onClick={onSelect}
      className="group text-left w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="glass-panel ios-shadow bg-gradient-to-br from-[rgba(45,55,72,0.35)] via-[rgba(34,41,62,0.6)] to-[rgba(45,55,72,0.2)] rounded-3xl p-5 transition-transform duration-150 hover:-translate-y-1 hover:shadow-2xl border border-[var(--card-border)]">
            <div className="w-full relative aspect-[16/10] min-h-[200px] rounded-2xl overflow-hidden bg-[rgba(26,32,48,0.7)]">
          {hovered && basePath ? (
            <AnimatedHeroSprite
              basePath={basePath}
              frameCount={18}
              hero={false}
              intervalMs={140}
              idleFrames={[0, 1, 2, 3, 4, 5, 4, 3, 2, 1]}
              blinkFrames={[15, 16, 15]}
              minBlinkDelayMs={3800}
              maxBlinkDelayMs={7600}
              alt={character.name}
            />
          ) : (
            <Image src={character.cardImage} alt={character.name} fill className="object-contain pointer-events-none" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className={`badge ${rarityTone[character.rarity]}`}>{character.rarity}</span>
                {ownership && <span className="badge badge-neutral-soft">{ownership}</span>}
              </div>
              <div className="badge badge-positive flex items-center gap-1 px-2 py-1 text-xs">
                <Image src={goldIcon} alt="gold" width={16} height={16} className="object-contain" />
                <span className="leading-none">{character.gold.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-start items-end">
              <CountdownTimer auctionEnd={auction.auctionEnd} />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-start mt-6 gap-4">
          <div className="flex flex-col">
            <h3 className="text-[var(--text)] font-semibold leading-tight">{character.name}</h3>
            <p className="text-xs text-[var(--muted)]">{character.discipline}</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              STR {character.stats.strength} · INT {character.stats.intellect} · VIT {character.stats.vitality} · AGI {character.stats.agility}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}
