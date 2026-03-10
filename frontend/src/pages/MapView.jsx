import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiFetch } from "../utils/api";
import Loader from "../components/Loader";
import { CheckCircle2, Clock, Map } from "lucide-react";

// Fix default marker icons for Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const paidIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    className: "leaflet-marker-blink"
});

const pendingIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    className: "leaflet-marker-blink"
});

// Geocode an address using Nominatim (free, no API key)
async function geocode(address) {
    try {
        const query = encodeURIComponent(address + ", India");
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch {
        // silently skip
    }
    return null;
}

export default function MapView() {
    const [properties, setProperties] = useState([]);
    const [mapped, setMapped] = useState([]);
    const [loading, setLoading] = useState(true);
    const [geocoding, setGeocoding] = useState(false);

    useEffect(() => {
        apiFetch("/api/properties")
            .then((r) => r.json())
            .then(setProperties)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (properties.length === 0) return;

        const run = async () => {
            setGeocoding(true);
            const results = [];
            for (const p of properties) {
                const coords = await geocode(p.address);
                if (coords) results.push({ ...p, coords });
                // Rate-limit: Nominatim asks for max 1 request/second
                await new Promise((r) => setTimeout(r, 1100));
            }
            setMapped(results);
            setGeocoding(false);
        };
        run();
    }, [properties]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] pt-24 pb-10 px-6 md:px-10">
            <style>{`
                @keyframes marker-blink {
                    0% { opacity: 1; transform: scale(1); filter: brightness(1); }
                    50% { opacity: 0.6; transform: scale(1.15); filter: brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,0.8)); }
                    100% { opacity: 1; transform: scale(1); filter: brightness(1); }
                }
                .leaflet-marker-blink {
                    animation: marker-blink 1.5s infinite ease-in-out;
                }
            `}</style>

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Map size={14} /> Property Map
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Properties on Map</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {geocoding
                            ? `Geocoding addresses… (${mapped.length}/${properties.length} done)`
                            : `Showing ${mapped.length} of ${properties.length} properties`}
                    </p>
                    {/* Legend */}
                    <div className="flex gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <CheckCircle2 size={13} className="text-emerald-500" /> Paid (green pin)
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Clock size={13} className="text-red-500" /> Pending (red pin)
                        </span>
                    </div>
                </div>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700" style={{ height: "540px" }}>
                    <MapContainer
                        center={[20.5937, 78.9629]}   // Center of India
                        zoom={5}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {mapped.map((p) => (
                            <Marker
                                key={p._id}
                                position={[p.coords.lat, p.coords.lng]}
                                icon={p.paymentStatus === "paid" ? paidIcon : pendingIcon}
                            >
                                <Popup>
                                    <div className="text-sm min-w-[180px]">
                                        <p className="font-bold text-slate-800 mb-1">{p.ownerName}</p>
                                        <p className="text-slate-500 text-xs mb-1">{p.address}</p>
                                        <p className="font-semibold text-blue-700">₹{Number(p.finalTaxAmount).toLocaleString("en-IN")}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                            {p.paymentStatus === "paid" ? "Paid" : "Pending"}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {properties.length > 0 && mapped.length === 0 && !geocoding && (
                    <p className="text-center text-slate-400 dark:text-slate-500 mt-6 text-sm">
                        Could not geocode any addresses. Ensure your property addresses include city and state.
                    </p>
                )}
            </div>
        </div>
    );
}
