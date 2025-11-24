"use client";

import { useAuctionStore } from "@/hooks/useAuctionStore";
import { useBidStore } from "@/hooks/useBidStore";
import { Auction, AuctionFinished, Bid } from "@/types";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { User } from "next-auth";
import React, { ReactNode, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AuctionCreatedToast from "../components/AuctionCreatedToast";
import { getDetailedViewData } from "../actions/auctionActions";
import AuctionFinishedToast from "../components/AuctionFinishedToast";
import BidPlacedToast from "../components/BidPlacedToast";
import { getLeaderboard, getMyProgress } from "../actions/gamificationActions";
import { useProfileStore } from "@/hooks/useProfileStore";

type Props = {
  children: ReactNode;
  user: User | null;
};

export default function SignalRProvider({ children, user }: Props) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const setCurrentPrice = useAuctionStore((state) => state.setCurrentPrice);
  const addBid = useBidStore((state) => state.addBid);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLeaderboard = useProfileStore((state) => state.setLeaderboard);
  const apiUrl =
    process.env.NODE_ENV === "production"
      ? "https://api.flogitdemoapp.co.uk/notifications"
      : process.env.NEXT_PUBLIC_NOTIFY_URL;

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(apiUrl!)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [apiUrl]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to notification hub");

          connection.on("BidPlaced", (bid: Bid) => {
            console.log("Bid placed event received");
            console.log(bid);
            if (bid.bidStatus.includes("Accepted")) {
              setCurrentPrice(bid.auctionId, bid.amount);
            }
            addBid(bid);
            if (user?.username === bid.bidder) {
              getMyProgress()
                .then((profile) => {
                  setProfile(profile ?? undefined);
                  return getLeaderboard();
                })
                .then(setLeaderboard)
                .catch(() => {});
            }

            const auction = getDetailedViewData(bid.auctionId);
            return toast.promise(
              auction,
              {
                loading: "Loading...",
                success: (auction) => (
                  <BidPlacedToast bid={bid} auction={auction} />
                ),
                error: (err) => "Bid placed !",
              },
              { success: { duration: 6000, icon: null } }
            );
          });

          connection.on("AuctionCreated", (auction: Auction) => {
            if (user?.username !== auction.seller) {
              return toast(<AuctionCreatedToast auction={auction} />, {
                duration: 6000,
              });
            }
          });

          connection.on(
            "AuctionFinished",
            (finishedAuction: AuctionFinished) => {
              if (
                user &&
            (finishedAuction.winner === user.username ||
              finishedAuction.seller === user.username)
          ) {
            getMyProgress()
              .then((profile) => {
                setProfile(profile ?? undefined);
                return getLeaderboard();
              })
                  .then(setLeaderboard)
                  .catch(() => {});
              }

              const auction = getDetailedViewData(finishedAuction.auctionId);
              return toast.promise(
                auction,
                {
                  loading: "Loading...",
                  success: (auction) => (
                    <AuctionFinishedToast
                      finishedAuction={finishedAuction}
                      auction={auction}
                    />
                  ),
                  error: (err) => "Auction finished!",
                },
                { success: { duration: 6000, icon: null } }
              );
            }
          );
        })
        .catch((error) => console.log(error));
    }

    return () => {
      connection?.stop();
    };
  }, [connection, setCurrentPrice, addBid, user, setProfile, setLeaderboard]);

  return children;
}
