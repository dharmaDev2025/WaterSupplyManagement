import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

interface LocationValue {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  initialLatitude: number | null;
  initialLongitude: number | null;

  onConfirm: (
    latitude: number,
    longitude: number
  ) => void;

  onClose: () => void;
}

// ==========================================
// LEAFLET MARKER ICON
// ==========================================

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

// ==========================================
// SELECT LOCATION BY CLICKING MAP
// ==========================================

function MapClickHandler({
  setLocation,
}: {
  setLocation: (location: LocationValue) => void;
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

// ==========================================
// MOVE MAP WHEN LOCATION CHANGES
// ==========================================

function ChangeMapView({
  location,
}: {
  location: LocationValue;
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

// ==========================================
// LOCATION PICKER
// ==========================================

function LocationPicker({
  initialLatitude,
  initialLongitude,
  onConfirm,
  onClose,
}: LocationPickerProps) {
  const [location, setLocation] =
    useState<LocationValue>({
      // Default is used only when customer
      // does not already have coordinates.
      latitude: initialLatitude ?? 20.2961,
      longitude: initialLongitude ?? 85.8245,
    });

  const [gettingLocation, setGettingLocation] =
    useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // USE CURRENT LOCATION
  // ==========================================

  const handleCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setGettingLocation(false);
      },

      (geoError) => {
        console.log(
          "Geolocation Error:",
          geoError
        );

        setGettingLocation(false);

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

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Choose Delivery Location
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Click on the map or drag the marker
              to select your exact location.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl font-medium text-slate-600 transition hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}

        <div className="p-5">
          {/* CURRENT LOCATION */}

          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={gettingLocation}
            className="mb-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>📍</span>

            {gettingLocation
              ? "Getting Location..."
              : "Use My Current Location"}
          </button>

          {/* MAP */}

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <MapContainer
              center={[
                location.latitude,
                location.longitude,
              ]}
              zoom={14}
              style={{
                width: "100%",
                height: "380px",
              }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickHandler
                setLocation={setLocation}
              />

              <ChangeMapView
                location={location}
              />

              <Marker
                position={[
                  location.latitude,
                  location.longitude,
                ]}
                icon={markerIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const marker =
                      event.target;

                    const position =
                      marker.getLatLng();

                    setLocation({
                      latitude: position.lat,
                      longitude: position.lng,
                    });
                  },
                }}
              />
            </MapContainer>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Click anywhere on the map or drag the
            marker to choose the delivery point.
          </p>

          {/* COORDINATES */}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Latitude
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {location.latitude.toFixed(6)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Longitude
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ACTIONS */}

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                onConfirm(
                  location.latitude,
                  location.longitude
                )
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;