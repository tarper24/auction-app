import { useEffect, useState } from "react";
import { getListings } from "./api/listings";
import CreateListingForm from "./components/CreateListingForm";
import ListingCard from "./components/ListingCard";
import ListingDetail from "./components/ListingDetail";
import type { Listing } from "./types";

export default function App() {
	const [listings, setListings] = useState<Listing[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [category, setCategory] = useState<string>("");
	const [active, setActive] = useState<boolean | null>(null);
	const [price, setPrice] = useState<number | "">("");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getListings(page, pageSize, category ? category : undefined, active ?? undefined, price ? price : undefined)
			.then((data) => setListings(data.listings))
			.catch((err) =>
				setError(
					err instanceof Error ? err.message : "Failed to load listings",
				),
			)
			.finally(() => setLoading(false));
	}, [page, pageSize, category, active, price]);

	const selectedListing = listings.find((l) => l.id === selectedId) ?? null;

	const handleBidSuccess = (updated: Listing) => {
		setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
	};

	const handleListingCreated = (listing: Listing) => {
		setListings((prev) => [...prev, listing]);
		setSelectedId(listing.id);
		setShowCreateForm(false);
	};

	return (
		<div className="app">
			<header className="app-header">
				<h1>Interview Auctions</h1>
				<p className="app-header__subtitle">Farm Equipment Marketplace</p>
			</header>
			<div className="app-body">
				<aside className="panel panel--left">
					<div className="panel__heading-row">
						<h2 className="panel__heading">Listings</h2>
						<span className="pagination__page-size">
							Page Size:
							<select
								value={pageSize}
								onChange={(e) => {
									setPageSize(Number(e.target.value));
									setPage(1);
								}}
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
							</select>
						</span>
						<button
							type="button"
							className="panel__heading-action"
							onClick={() => {
								setShowCreateForm(true);
								setSelectedId(null);
							}}
						>
							+ New
						</button>
					</div>
					<div className="filters">
						<label>
							Category:
							<select
								value={category ?? ""}
								onChange={(e) => setCategory(e.target.value)}
							>
								<option value="">All</option>
								<option value="tractor">Tractor</option>
								<option value="combine">Combine</option>
								<option value="implement">Implement</option>
								<option value="attachment">Attachment</option>
							</select>
						</label>
						<label>
							<button
								type="button"
								className={active === true ? "active" : ""}
								onClick={() => setActive(true)}
							>
								Active
							</button>
							<button
								type="button"
								className={active === false ? "active" : ""}
								onClick={() => setActive(false)}
							>
								Closed
							</button>
							<button
								type="button"
								className={active === null ? "active" : ""}
								onClick={() => setActive(null)}
							>
								All
							</button>
						</label>
						<label>
							Max Price:
							<input
								type="number"
								value={price}
								onChange={(e) => setPrice(Number(e.target.value))}
							/>
						</label>
					</div>
					{loading && <div className="state-message">Loading listings…</div>}
					{error && (
						<div className="state-message state-message--error">{error}</div>
					)}
					{!loading && !error && (
						<div className="listing-grid">
							{listings.map((listing) => (
								<ListingCard
									key={listing.id}
									listing={listing}
									isSelected={listing.id === selectedId}
									onClick={() => setSelectedId(listing.id)}
								/>
							))}
						</div>
					)}
					<div className="pagination">
						<button
							type="button"
							disabled={page === 1}
							onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
						>
							&laquo;
						</button>
						<span className="pagination__page">{page}</span>
						<button
							type="button"
							disabled={listings.length < pageSize}
							onClick={() => setPage((prev) => prev + 1)}
						>
							&raquo;
						</button>
					</div>
				</aside>
				<main className="panel panel--right">
					{showCreateForm ? (
						<CreateListingForm onSuccess={handleListingCreated} />
					) : selectedListing ? (
						<ListingDetail
							listing={selectedListing}
							onBidSuccess={handleBidSuccess}
						/>
					) : (
						<div className="empty-state">
							<p>Select a listing to view details and place a bid.</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
