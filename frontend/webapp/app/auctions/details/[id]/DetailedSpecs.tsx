'use client';

import {useEffect} from "react";
import {Auction} from "@/types";
import {Table} from "flowbite-react";
import { useRouter } from "next/navigation";
import { formatGold } from "@/app/lib/numberWithComma";
import { CharacterDefinition } from "@/app/data/characterCatalog";
import Image from "next/image";
import goldIcon from "@/public/gold2.png";

type Props = {
    auction: Auction;
    character?: CharacterDefinition;
}
export default function DetailedSpecs({auction, character}: Props) {
    const router = useRouter();
    useEffect(() => {
        if (!auction || !auction.id) {
            router.push('/');
        }
    }, [auction, router]);
    if (!auction || !auction.id) return null;
    
    return (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/70">
            <Table striped={false} className="text-slate-700">
                <Table.Body className="divide-y divide-white/60">
                    <Table.Row className="bg-transparent">
                        <Table.Cell className="whitespace-nowrap font-semibold text-slate-900">
                            Seller
                        </Table.Cell>
                        <Table.Cell>
                            {auction.seller}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row className="bg-transparent">
                        <Table.Cell className="whitespace-nowrap font-semibold text-slate-900">
                            Discipline
                        </Table.Cell>
                        <Table.Cell>
                            {character?.discipline ?? auction.category}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row className="bg-transparent">
                        <Table.Cell className="whitespace-nowrap font-semibold text-slate-900">
                            Rarity
                        </Table.Cell>
                        <Table.Cell>
                            {character?.rarity ?? 'Unknown'}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row className="bg-transparent">
                        <Table.Cell className="whitespace-nowrap font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                                <Image src={goldIcon} alt="gold" width={16} height={16} className="object-contain" />
                                Value
                            </div>
                        </Table.Cell>
                        <Table.Cell className="flex items-center gap-2">
                            <Image src={goldIcon} alt="gold" width={16} height={16} className="object-contain" />
                            {character ? formatGold(character.gold) : '-'}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row className="bg-transparent">
                        <Table.Cell className="whitespace-nowrap font-semibold text-slate-900">
                            Reserve
                        </Table.Cell>
                        <Table.Cell>
                            {auction.reservePrice > 0 ? formatGold(auction.reservePrice) : 'No reserve'}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row className="bg-transparent">
                        <Table.Cell className="whitespace-nowrap font-semibold text-slate-900">
                            Specs
                        </Table.Cell>
                        <Table.Cell>
                            {auction.specs}
                        </Table.Cell>
                    </Table.Row>
                    {character && (
                      <Table.Row className="bg-transparent">
                        <Table.Cell className="whitespace-nowrap font-semibold text-slate-900">
                          Base Stats
                        </Table.Cell>
                        <Table.Cell className="space-x-2 text-sm text-slate-800">
                          <span>STR {character.stats.strength}</span>
                          <span>INT {character.stats.intellect}</span>
                          <span>VIT {character.stats.vitality}</span>
                          <span>AGI {character.stats.agility}</span>
                        </Table.Cell>
                      </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </div>
    )
}
