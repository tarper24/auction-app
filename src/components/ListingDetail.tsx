import { useEffect, useState } from "react";
import BidForm from "./BidForm";
import type { Listing } from "../types";

interface Props {
	listing: Listing;
	onBidSuccess: (updated: Listing) => void;
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function timeRemaining(endsAt: string, status: string, now: number): [string, string] {
	if (status === "closed") return ["Ended", "listing-detail__time--ended"];
	const diff = new Date(endsAt).getTime() - now;
	if (diff <= 0) return ["Ended", "listing-detail__time--ended"];
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor(diff / (1000 * 60));
	const seconds = Math.floor(diff / 1000);
	const timeLeft: string =
		days > 0 ? `${days} day${days === 1 ? "" : "s"} left` :
			hours > 0 ? `${hours} hour${hours === 1 ? "" : "s"} left` :
				minutes > 0 ? `${minutes} minute${minutes === 1 ? "" : "s"} left` :
					`${seconds} second${seconds === 1 ? "" : "s"} left`;

	// Use ending soon if less than 1 hour remaining
	const className = hours < 1 ? "listing-detail__time--ending-soon" : "";

	return [timeLeft, className];
}

export default function ListingDetail({ listing, onBidSuccess }: Props) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	return (
		<div className="listing-detail">
			<img
				src={listing.imageUrl}
				alt={listing.title}
				className="listing-detail__image"
			/>
			<div className="listing-detail__header">
				<span className={`badge badge--${listing.category}`}>
					{listing.category}
				</span>
				<span className={`status-badge status-badge--${listing.status}`}>
					{listing.status}
				</span>
			</div>
			<h2 className="listing-detail__title">{listing.title}</h2>
			<p className="listing-detail__description">{listing.description}</p>

			<div className="listing-detail__meta">
				<div className="meta-row">
					<span className="meta-label">Starting Price</span>
					<span className="meta-value">
						${listing.startingPrice.toLocaleString()}
					</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Current Bid</span>
					<span className="meta-value meta-value--highlight">
						${listing.currentBid.toLocaleString()}
					</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Current Bidder</span>
					<span className="meta-value">
						{listing.currentBidder ?? "No bids yet"}
					</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Auction Ends</span>
					<span className="meta-value">{formatDate(listing.endsAt)}</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Bid History</span>
					<span className="meta-value">
						{listing.bidHistory.length} {listing.bidHistory.length === 1 ? "bid" : "bids"}
					</span>
				</div>
				<div className="meta-row">
					<span className="meta-label">Time Remaining</span>
					<span className="meta-value">
						{(() => {
							const [text, className] = timeRemaining(listing.endsAt, listing.status, now);
							return <span className={className}>{text}</span>;
						})()}
					</span>
				</div>
			</div>

			<div className="listing-detail__bid-history">
				<h3>Bid History</h3>
				{listing.bidHistory.length === 0 ? (
					<div className="listing-detail__no-bids">
						No bids yet.
					</div>
				) : (
					listing.bidHistory.map((bid, index) => (
						<div key={index} className="bid-history">
							<div className="history-bidder">{bid.bidder}</div>
							<div className="history-amount">${bid.amount.toLocaleString()}</div>
						</div>
					))
				)}
			</div>

			{listing.status === "active" && (
				<BidForm listing={listing} onBidSuccess={onBidSuccess} />
			)}
		</div>
	);
}
