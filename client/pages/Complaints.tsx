import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, FileVideo, MapPin, Navigation, Search, Send, UploadCloud } from "lucide-react";
import { getRole } from "@/lib/auth";
import exifr from "exifr";

const demoComplaints = [
	{
		id: "AP-2025-0001",
		title: "Pothole near Benz Circle",
		category: "Roads",
		ward: "Vijayawada - Ward 12",
		submittedBy: "citizen.ap01",
		status: "Open",
		slaHrs: 48,
		createdAt: "2025-01-08 10:15",
	},
	{
		id: "AP-2025-0002",
		title: "Water leakage at Dwarakanagar",
		category: "Water",
		ward: "Visakhapatnam - Ward 8",
		submittedBy: "citizen.ap02",
		status: "Assigned",
		slaHrs: 24,
		createdAt: "2025-01-08 09:10",
	},
	{
		id: "AP-2025-0003",
		title: "Streetlight not working, Brodipet",
		category: "Electricity",
		ward: "Guntur - Ward 4",
		submittedBy: "citizen.ap03",
		status: "In Progress",
		slaHrs: 36,
		createdAt: "2025-01-07 19:40",
	},
	{
		id: "AP-2025-0004",
		title: "Garbage overflow, RTC Colony",
		category: "Waste",
		ward: "Tirupati - Ward 6",
		submittedBy: "citizen.ap04",
		status: "Resolved",
		slaHrs: 12,
		createdAt: "2025-01-07 08:25",
	},
];

const CATEGORY_OPTIONS = [
	"Roads",
	"Water",
	"Sanitary",
	"Electricity",
	"Animal Management",
	"Waste",
	"Parks",
	"Other",
];

export default function Complaints() {
	const [role, setRole] = useState<"citizen" | "officer" | "admin">(() => getRole());
	const [step, setStep] = useState(1);
	const [category, setCategory] = useState("Roads");
	const [description, setDescription] = useState("");
	const [media, setMedia] = useState<File | null>(null);
	const [coords, setCoords] = useState<string>("");
	const [location, setLocation] = useState<string>("");
	const [locationLoading, setLocationLoading] = useState(false);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [latLng, setLatLng] = useState<{ lat: number; lon: number } | null>(null);
	const [categories, setCategories] = useState<string[]>(["Roads"]);
	const [categoryInput, setCategoryInput] = useState("");
	const [categoryLoading, setCategoryLoading] = useState(false);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const onRole = (e: any) => setRole(e.detail || getRole());
		window.addEventListener("role-change", onRole as any);
		return () => window.removeEventListener("role-change", onRole as any);
	}, []);

	function next() {
		setStep((s) => Math.min(3, s + 1));
	}
	function prev() {
		setStep((s) => Math.max(1, s - 1));
	}

	function getGPS() {
		if (!navigator.geolocation) return toast.error("Geolocation not supported");
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const c = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
				setCoords(c);
				toast.success(`Location captured: ${c}`);
			},
			() => toast.error("Location denied")
		);
	}

	async function suggestCategories() {
		setCategoryLoading(true);
		setCategoryInput("");
		try {
			const response = await fetch("/api/gemini-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message:
						`Given the following civic complaint description, select all relevant categories from this list: [${CATEGORY_OPTIONS.join(", ")}]. ` +
						`Return only an array of category names (no explanation, no extra text). Description: "${description}"`,
				}),
			});
			const data = await response.json();
			// Try to parse categories from response
			let cats: string[] = [];
			if (typeof data.response === "string") {
				// Try to parse as JSON array
				try {
					cats = JSON.parse(data.response);
				} catch {
					// Fallback: extract category names from string
					cats = CATEGORY_OPTIONS.filter((opt) =>
						data.response.toLowerCase().includes(opt.toLowerCase())
					);
				}
			}
			if (cats.length > 0) {
				setCategories(Array.from(new Set([...categories, ...cats])));
			}
		} catch (err) {
			toast.error("Failed to get category suggestion from AI");
		}
		setCategoryLoading(false);
	}

	function removeCategory(cat: string) {
		setCategories(categories.filter((c) => c !== cat));
	}

	function addCategory() {
		const trimmed = categoryInput.trim();
		if (trimmed && !categories.includes(trimmed)) {
			setCategories([...categories, trimmed]);
			setCategoryInput("");
		}
	}

	function submit() {
		console.log("Complaint submitted with:");
		console.log("Categories:", categories);
		console.log("Description:", description);
		console.log("Media:", media);
		console.log("Coords:", coords);
		console.log("Location:", location);
		console.log("LatLng:", latLng);

		toast.success("Complaint submitted (demo)");
		setStep(1);
		setCategories(["Roads"]);
		setCategoryInput("");
		setDescription("");
		setMedia(null);
		setCoords("");
		setLocation("");
		setLocationError(null);
		setLatLng(null);
	}

	const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setMedia(file);

		if (!file) return;

		// Only try EXIF/location if image
		if (file.type.startsWith("image/")) {
			try {
				const tags = await exifr.parse(file, { gps: true });
				if (tags && tags.latitude && tags.longitude) {
					setLocationLoading(true);
					// Reverse geocode
					const lat = tags.latitude;
					const lon = tags.longitude;
					setLatLng({ lat, lon });
					try {
						const res = await fetch(
							`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
						);
						const data = await res.json();
						if (data && data.display_name) {
							setLocation(data.display_name);
						} else {
							setLocation(`${lat}, ${lon}`);
							setLocationError("Unable to resolve address, using coordinates.");
						}
					} catch {
						setLocation(`${lat}, ${lon}`);
						setLocationError("Unable to resolve address, using coordinates.");
					}
					setLocationLoading(false);
				} else {
					setLocationError("No GPS data found in image. Please enter location manually or use your device location.");
				}
			} catch {
				setLocationError("Failed to read EXIF data. Please enter location manually or use your device location.");
			}
		}
	};

	const handleUseDeviceLocation = () => {
		setLocationLoading(true);
		setLocationError(null);
		if (!navigator.geolocation) {
			setLocationError("Geolocation is not supported by your browser.");
			setLocationLoading(false);
			return;
		}
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const lat = pos.coords.latitude;
				const lon = pos.coords.longitude;
				setLatLng({ lat, lon });
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
					);
					const data = await res.json();
					if (data && data.display_name) {
						setLocation(data.display_name);
					} else {
						setLocation(`${lat}, ${lon}`);
						setLocationError("Unable to resolve address, using coordinates.");
					}
				} catch {
					setLocation(`${lat}, ${lon}`);
					setLocationError("Unable to resolve address, using coordinates.");
				}
				setLocationLoading(false);
			},
			() => {
				setLocationError("Failed to get device location.");
				setLocationLoading(false);
			}
		);
	};

	const handleLocationInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setLocation(value);
		setLocationError(null);
		setLatLng(null);

		// Try to geocode if it's not empty and not coordinates
		if (value.trim()) {
			// If value looks like coordinates
			const coordMatch = value.match(/^\s*(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)\s*$/);
			if (coordMatch) {
				const lat = parseFloat(coordMatch[1]);
				const lon = parseFloat(coordMatch[3]);
				setLatLng({ lat, lon });
			} else {
				// Geocode address
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
							value
						)}&limit=1`
					);
					const data = await res.json();
					if (data && data.length > 0) {
						const lat = parseFloat(data[0].lat);
						const lon = parseFloat(data[0].lon);
						setLatLng({ lat, lon });
					} else {
						setLocationError("Could not find location for the given address.");
					}
				} catch {
					setLocationError("Failed to geocode the address.");
				}
			}
		}
	};

	if (role === "admin") {
		return (
			<div className="container py-8 space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--navy))" }}>
						Posted Complaints
					</h1>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<input
								placeholder="Search ID, title, ward"
								className="pl-8 pr-3 py-2 rounded-md border bg-background text-sm"
							/>
						</div>
						<select className="rounded-md border bg-background px-3 py-2 text-sm">
							{["All Status", "Open", "Assigned", "In Progress", "Resolved"].map((o) => (
								<option key={o}>{o}</option>
							))}
						</select>
						<select className="rounded-md border bg-background px-3 py-2 text-sm">
							{["All Categories", "Roads", "Water", "Electricity", "Waste"].map((o) => (
								<option key={o}>{o}</option>
							))}
						</select>
					</div>
				</div>

				<div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
					<table className="min-w-full text-sm">
						<thead className="bg-muted/50">
							<tr className="text-left">
								<th className="px-4 py-3">ID</th>
								<th className="px-4 py-3">Title</th>
								<th className="px-4 py-3">Category</th>
								<th className="px-4 py-3">Ward</th>
								<th className="px-4 py-3">Submitted By</th>
								<th className="px-4 py-3">Status</th>
								<th className="px-4 py-3">SLA (hrs)</th>
								<th className="px-4 py-3">Created</th>
							</tr>
						</thead>
						<tbody>
							{demoComplaints.map((c) => (
								<tr key={c.id} className="border-t">
									<td className="px-4 py-3 font-mono text-xs">{c.id}</td>
									<td className="px-4 py-3">{c.title}</td>
									<td className="px-4 py-3">{c.category}</td>
									<td className="px-4 py-3">{c.ward}</td>
									<td className="px-4 py-3">{c.submittedBy}</td>
									<td className="px-4 py-3">{c.status}</td>
									<td className="px-4 py-3">{c.slaHrs}</td>
									<td className="px-4 py-3">{c.createdAt}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className="text-xs text-muted-foreground">
					Admins can view/triage complaints here. Submission is disabled for admins.
				</p>
			</div>
		);
	}

	return (
		<div className="container py-8 space-y-8">
			<h1 className="text-2xl md:text-3xl font-bold" style={{ color: "hsl(var(--navy))" }}>
				Submit & Track Complaints
			</h1>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
					<div className="flex items-center gap-2 text-sm mb-4">
						<span
							className={`px-2 py-1 rounded ${
								step === 1 ? "bg-primary text-primary-foreground" : "bg-muted"
							}`}
						>
							1. Details
						</span>
						<span
							className={`px-2 py-1 rounded ${
								step === 2 ? "bg-primary text-primary-foreground" : "bg-muted"
							}`}
						>
							2. Media
						</span>
						<span
							className={`px-2 py-1 rounded ${
								step === 3 ? "bg-primary text-primary-foreground" : "bg-muted"
							}`}
						>
							3. Location
						</span>
					</div>

					{step === 1 && (
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium">Categories</label>
								<div className="flex flex-wrap gap-2 mt-2">
									{categories.map((cat) => (
										<span
											key={cat}
											className="inline-flex items-center bg-primary/10 px-2 py-1 rounded text-xs"
										>
											{cat}
											<button
												type="button"
												onClick={() => removeCategory(cat)}
												style={{
													marginLeft: 4,
													color: "#888",
													fontWeight: "bold",
													cursor: "pointer",
													border: "none",
													background: "none",
												}}
												aria-label={`Remove ${cat}`}
											>
												×
											</button>
										</span>
									))}
								</div>
								<div className="flex gap-2 mt-2">
									<input
										type="text"
										value={categoryInput}
										onChange={(e) => setCategoryInput(e.target.value)}
										placeholder="Add category"
										className="rounded-md border px-2 py-1 text-sm"
										list="category-options"
									/>
									<datalist id="category-options">
										{CATEGORY_OPTIONS.map((opt) => (
											<option key={opt} value={opt} />
										))}
									</datalist>
									<Button
										type="button"
										size="sm"
										onClick={addCategory}
										disabled={!categoryInput.trim()}
									>
										Add
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={suggestCategories}
										disabled={categoryLoading || !description.trim()}
									>
										{categoryLoading ? "Suggesting..." : "Suggest with AI"}
									</Button>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Use "Suggest with AI" to auto-categorize based on your description.
								</p>
							</div>
							<div>
								<label className="text-sm font-medium">Description</label>
								<textarea
									ref={descriptionRef}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={5}
									className="mt-1 w-full rounded-md border bg-background px-3 py-2"
									placeholder="Describe the issue with landmarks, time, etc."
								/>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">Attach photo/video evidence (optional).</p>
							<label className="flex items-center justify-between gap-4 rounded-md border p-4 cursor-pointer hover:bg-muted">
								<div className="flex items-center gap-3">
									<UploadCloud className="h-5 w-5" />
									<div>
										<div className="font-medium">Upload</div>
										<div className="text-xs text-muted-foreground">JPG, PNG, MP4 up to 20MB</div>
									</div>
								</div>
								<input
									type="file"
									accept="image/*,video/*"
									className="hidden"
									onChange={handleMediaChange}
								/>
							</label>
							{media && <div className="text-sm">Selected: {media.name}</div>}
						</div>
					)}

					{step === 3 && (
						<div className="space-y-4">
							<label>
								Location:
								<input
									type="text"
									value={location}
									onChange={handleLocationInput}
									placeholder="Enter location or coordinates"
									style={{ width: "100%", marginTop: 4 }}
								/>
							</label>
							{/* Only show "Use My Location" if no coordinates are present */}
							{!latLng && (
								<button
									type="button"
									onClick={handleUseDeviceLocation}
									disabled={locationLoading}
									style={{ marginLeft: 8 }}
								>
									{locationLoading ? "Detecting..." : "Use My Location"}
								</button>
							)}
							{locationError && <div style={{ color: "red", marginTop: 8 }}>{locationError}</div>}
							<div
								className="aspect-[16/9] w-full overflow-hidden rounded-lg border"
								style={{ position: "relative" }}
							>
								<iframe
									title="Map"
									className="h-full w-full"
									src={
										latLng
											? `https://www.openstreetmap.org/export/embed.html?bbox=${latLng.lon - 0.01},${
													latLng.lat - 0.01
											  },${latLng.lon + 0.01},${latLng.lat + 0.01}&layer=mapnik&marker=${latLng.lat},${
													latLng.lon
											  }`
											: "https://www.openstreetmap.org/export/embed.html?bbox=67.5,6.5,97.5,37.5&layer=mapnik"
									}
								/>
							</div>
						</div>
					)}

					<div className="mt-6 flex justify-between">
						<Button variant="ghost" onClick={prev} disabled={step === 1}>
							Back
						</Button>
						{step < 3 ? (
							<Button onClick={next} className="gap-2">
								Next <Send className="h-4 w-4" />
							</Button>
						) : (
							<Button onClick={submit} className="gap-2">
								Submit <Send className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				<div className="space-y-4">
					<div className="rounded-2xl border bg-card p-5 shadow-sm">
						<div className="flex items-center gap-2 font-semibold">
							<MapPin className="h-4 w-4 text-primary" /> Tracking Timeline
						</div>
						<ol className="mt-3 space-y-3 text-sm">
							<li className="border-l-2 pl-3">Submitted • 10:15 AM</li>
							<li className="border-l-2 pl-3">Assigned to Ward Officer</li>
							<li className="border-l-2 pl-3">In Progress</li>
							<li className="border-l-2 pl-3">Resolved</li>
						</ol>
					</div>
					<div className="rounded-2xl border bg-card p-5 shadow-sm">
						<div className="font-semibold">Recently submitted</div>
						<ul className="mt-3 space-y-2 text-sm">
							<li className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<Camera className="h-4 w-4" /> Pothole - Ward 12
								</span>
								<span>Open</span>
							</li>
							<li className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<FileVideo className="h-4 w-4" /> Water leak - Sector 8
								</span>
								<span>Assigned</span>
							</li>
							<li className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<Camera className="h-4 w-4" /> Streetlight - Block C
								</span>
								<span>Resolved</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
