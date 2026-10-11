"use client";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (
    latitude: number,
    longitude: number,
  ) => void;
}

/* -------------------------------------------------
   Leaflet Marker Icon
------------------------------------------------- */

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
});

/* -------------------------------------------------
   Map Click Handler
------------------------------------------------- */

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (
    latitude: number,
    longitude: number,
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationSelect(
        event.latlng.lat,
        event.latlng.lng,
      );
    },
  });

  return null;
}

/* -------------------------------------------------
   Map Center Updater
------------------------------------------------- */

function MapCenterUpdater({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMapEvents({});

  useEffect(() => {
    if (
      latitude !== null &&
      longitude !== null
    ) {
      map.setView(
        [latitude, longitude],
        map.getZoom() < 13
          ? 15
          : map.getZoom(),
      );
    }
  }, [latitude, longitude, map]);

  return null;
}

/* -------------------------------------------------
   Main Location Picker
------------------------------------------------- */

export default function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}: LocationPickerProps) {
  /* Default location: Colombo */
  const defaultLatitude = 6.9271;
  const defaultLongitude = 79.8612;

  /* GPS state */
  const [locating, setLocating] =
    useState(false);

  /* Search state */
  const [searchQuery, setSearchQuery] =
    useState("");

  const [searching, setSearching] =
    useState(false);

  /* Map center */
  const center: [number, number] =
    latitude !== null &&
    longitude !== null
      ? [latitude, longitude]
      : [
          defaultLatitude,
          defaultLongitude,
        ];

  /* -------------------------------------------------
     Use My Location
  ------------------------------------------------- */

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser.",
      );

      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude: currentLatitude,
          longitude: currentLongitude,
        } = position.coords;

        onLocationSelect(
          currentLatitude,
          currentLongitude,
        );

        setLocating(false);
      },

      (error) => {
        console.error(
          "Location error code:",
          error.code,
        );

        console.error(
          "Location error message:",
          error.message,
        );

        setLocating(false);

        if (error.code === 1) {
          alert(
            "Location permission was denied. Please allow location access for localhost:3000.",
          );
        } else if (error.code === 2) {
          alert(
            "Your location is currently unavailable. Please check your device location settings.",
          );
        } else if (error.code === 3) {
          alert(
            "Location request timed out. Please try again.",
          );
        } else {
          alert(
            "Unable to get your location. Please try again.",
          );
        }
      },

      {
     enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0,
      },
    );
  };

  /* -------------------------------------------------
     Search Location
  ------------------------------------------------- */

  const handleSearchLocation = async () => {
    const query = searchQuery.trim();

    if (!query) {
      alert(
        "Please enter a location to search.",
      );

      return;
    }

    try {
      setSearching(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=lk&q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Location search failed.",
        );
      }

      const results =
        await response.json();

      if (
        !results ||
        results.length === 0
      ) {
        alert(
          "Location not found. Please try another search.",
        );

        return;
      }

      const selectedLatitude =
        Number(results[0].lat);

      const selectedLongitude =
        Number(results[0].lon);

      onLocationSelect(
        selectedLatitude,
        selectedLongitude,
      );
    } catch (error) {
      console.error(
        "Location search error:",
        error,
      );

      alert(
        "Unable to search this location. Please try again.",
      );
    } finally {
      setSearching(false);
    }
  };

  /* -------------------------------------------------
     Search Enter Key
  ------------------------------------------------- */

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      handleSearchLocation();
    }
  };

  /* -------------------------------------------------
     UI
  ------------------------------------------------- */

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.mapHeader}>
        <div style={styles.headerContent}>
          <h3 style={styles.title}>
            Select Service Location
          </h3>

          <p style={styles.subtitle}>
            Search for your location or
            click on the map.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          style={{
            ...styles.locationButton,
            opacity: locating ? 0.7 : 1,
            cursor: locating
              ? "not-allowed"
              : "pointer",
          }}
        >
          📍{" "}
          {locating
            ? "Getting Location..."
            : "Use My Location"}
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchArea}>
        <div style={styles.searchRow}>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
            placeholder="Search location... Example: Monaragala"
            style={styles.searchInput}
            autoComplete="off"
          />

          <button
            type="button"
            onClick={
              handleSearchLocation
            }
            disabled={searching}
            style={{
              ...styles.searchButton,
              opacity: searching ? 0.7 : 1,
              cursor: searching
                ? "not-allowed"
                : "pointer",
            }}
          >
            🔍{" "}
            {searching
              ? "Searching..."
              : "Search"}
          </button>
        </div>

        <p style={styles.searchHelp}>
          Try searching for a city, town,
          village, hospital, hotel, or
          address.
        </p>
      </div>

      {/* Map */}
      <div style={styles.mapWrapper}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={styles.map}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            onLocationSelect={
              onLocationSelect
            }
          />

          <MapCenterUpdater
            latitude={latitude}
            longitude={longitude}
          />

          {latitude !== null &&
            longitude !== null && (
              <Marker
                position={[
                  latitude,
                  longitude,
                ]}
                icon={markerIcon}
              />
            )}
        </MapContainer>
      </div>

      {/* Coordinates */}
      {latitude !== null &&
        longitude !== null && (
          <div style={styles.coordinates}>
            <div>
              <span
                style={
                  styles.coordinateLabel
                }
              >
                Latitude
              </span>

              <strong
                style={
                  styles.coordinateValue
                }
              >
                {latitude.toFixed(6)}
              </strong>
            </div>

            <div>
              <span
                style={
                  styles.coordinateLabel
                }
              >
                Longitude
              </span>

              <strong
                style={
                  styles.coordinateValue
                }
              >
                {longitude.toFixed(6)}
              </strong>
            </div>
          </div>
        )}

      {/* Help */}
      <p style={styles.helpText}>
        💡 Click anywhere on the map to
        move the location marker.
      </p>
    </div>
  );
}

/* -------------------------------------------------
   Styles
------------------------------------------------- */

const styles: Record<
  string,
  React.CSSProperties
> = {
  wrapper: {
    width: "100%",
    marginTop: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#ffffff",
    boxSizing: "border-box",
  },

  mapHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "18px",
    borderBottom: "1px solid #e2e8f0",
    background: "#ffffff",
    boxSizing: "border-box",
  },

  headerContent: {
    minWidth: 0,
  },

  title: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 750,
    color: "#0f172a",
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  locationButton: {
    border: "none",
    padding: "10px 14px",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  searchArea: {
    padding: "16px 18px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    boxSizing: "border-box",
  },

  searchRow: {
    display: "flex",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "48px",
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",

    /* IMPORTANT: Fix invisible text */
    color: "#0f172a",

    /* White background */
    backgroundColor: "#ffffff",

    /* Visible cursor */
    caretColor: "#0f172a",

    outline: "none",
    boxSizing: "border-box",

    fontFamily: "Arial, sans-serif",
    fontWeight: 400,
  },

  searchButton: {
    height: "48px",
    border: "none",
    padding: "0 18px",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
    boxSizing: "border-box",
  },

  searchHelp: {
    margin: "8px 0 0",
    fontSize: "11px",
    color: "#64748b",
  },

  mapWrapper: {
    width: "100%",
    height: "380px",
    position: "relative",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  coordinates: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "12px",
    padding: "14px 18px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    boxSizing: "border-box",
  },

  coordinateLabel: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "3px",
  },

  coordinateValue: {
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: 700,
  },

  helpText: {
    margin: 0,
    padding: "0 18px 16px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
  },
};

/* -------------------------------------------------
   Responsive Styles
------------------------------------------------- */

if (typeof document !== "undefined") {
  const styleId =
    "findmepro-location-picker-responsive";

  if (!document.getElementById(styleId)) {
    const style =
      document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      @media (max-width: 640px) {
        .findmepro-location-picker-search-row {
          flex-direction: column;
        }
      }
    `;

    document.head.appendChild(style);
  }
}