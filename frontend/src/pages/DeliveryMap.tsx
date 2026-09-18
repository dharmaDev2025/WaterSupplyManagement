import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import api from "../services/api";

// -----------------------------------------
// TYPES
// -----------------------------------------

interface Location {
  latitude: number;
  longitude: number;
}

// -----------------------------------------
// FIX LEAFLET DEFAULT MARKER ICON
// -----------------------------------------

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// -----------------------------------------
// MAP CLICK COMPONENT
// -----------------------------------------

function MapClickHandler({
  setLocation,
}: {
  setLocation: (location: Location) => void;
}) {
  useMapEvents({
    click(event) {
      setLocation({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

// -----------------------------------------
// MOVE MAP WHEN LOCATION CHANGES
// -----------------------------------------

function ChangeMapView({
  location,
}: {
  location: Location;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [location.latitude, location.longitude],
      16
    );
  }, [location, map]);

  return null;
}

// -----------------------------------------
// DELIVERY MAP
// -----------------------------------------

export default function DeliveryMap() {
  // Default position.
  // Current location can replace this automatically.
  const [location, setLocation] = useState<Location>({
    latitude: 20.2961,
    longitude: 85.8245,
  });

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // -----------------------------------------
  // GET CURRENT LOCATION
  // -----------------------------------------

  const handleCurrentLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        setLoadingLocation(false);

        setMessage(
          "Current location selected successfully."
        );
      },

      (geoError) => {
        console.log(
          "Location Error:",
          geoError
        );

        setLoadingLocation(false);

        if (
          geoError.code ===
          geoError.PERMISSION_DENIED
        ) {
          setError(
            "Location permission was denied. You can select your location manually on the map."
          );
        } else {
          setError(
            "Unable to get your current location. Please select it manually on the map."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // -----------------------------------------
  // SAVE LOCATION TO BACKEND
  // -----------------------------------------

  const handleSaveLocation = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.put(
        "/customers/location",
        {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      );

      setMessage(
        response.data.message ||
          "Delivery location saved successfully."
      );
    } catch (err) {
      console.error(
        "Save Location Error:",
        err
      );

      setError(
        "Unable to save delivery location."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          Delivery Location
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select where you want your water
          delivered.
        </p>
      </div>

      {/* CURRENT LOCATION BUTTON */}

      <button
        type="button"
        onClick={handleCurrentLocation}
        disabled={loadingLocation}
        className="mb-4 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingLocation
          ? "Getting Location..."
          : "📍 Use My Current Location"}
      </button>

      {/* MAP */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <MapContainer
          center={[
            location.latitude,
            location.longitude,
          ]}
          zoom={13}
          style={{
            height: "400px",
            width: "100%",
          }}
        >
          {/* OPENSTREETMAP */}

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* MAP CLICK */}

          <MapClickHandler
            setLocation={setLocation}
          />

          {/* MOVE MAP */}

          <ChangeMapView
            location={location}
          />

          {/* MARKER */}

          <Marker
            position={[
              location.latitude,
              location.longitude,
            ]}
            icon={markerIcon}
            draggable={true}
            eventHandlers={{
              dragend: (event) => {
                const marker =
                  event.target;

                const position =
                  marker.getLatLng();

                setLocation({
                  latitude:
                    position.lat,
                  longitude:
                    position.lng,
                });
              },
            }}
          />
        </MapContainer>
      </div>

      {/* HELP */}

      <p className="mt-3 text-sm text-slate-500">
        Click anywhere on the map or drag
        the marker to select your exact
        delivery location.
      </p>

      {/* COORDINATES */}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Latitude
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {location.latitude.toFixed(6)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Longitude
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {location.longitude.toFixed(
              6
            )}
          </p>
        </div>
      </div>

      {/* SUCCESS */}

      {message && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SAVE */}

      <button
        type="button"
        onClick={handleSaveLocation}
        disabled={saving}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? "Saving Location..."
          : "Save Delivery Location"}
      </button>
    </div>
  );
}