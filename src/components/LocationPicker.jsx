import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

// Fix Leaflet marker icons when using Vite.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_LOCATION = [12.9716, 77.5946];

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(event) {
      onLocationChange([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);

  return null;
}

function LocationPicker({ onAddressChange, initialAddress = "" }) {
  const [position, setPosition] = useState(DEFAULT_LOCATION);
  const [address, setAddress] = useState(initialAddress);

  useEffect(() => {
    if (initialAddress?.trim()) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reverseRequestRef = useRef(null);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    return () => {
      reverseRequestRef.current?.abort();
    };
  }, []);

  const reverseGeocode = async (lat, lng) => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    reverseRequestRef.current?.abort();

    const controller = new AbortController();
    reverseRequestRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Unable to find the address.");
      }

      const data = await response.json();
      const generatedAddress = data.display_name || "";

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setAddress(generatedAddress);
      onAddressChange(generatedAddress);
    } catch (requestError) {
      if (
        requestError?.name === "AbortError" ||
        requestVersion !== requestVersionRef.current
      ) {
        return;
      }

      setError(
        "Unable to get the address. Please enter it manually."
      );
    } finally {
      if (requestVersion === requestVersionRef.current) {
        reverseRequestRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleLocationChange = (newPosition) => {
    setPosition(newPosition);
    reverseGeocode(newPosition[0], newPosition[1]);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      return;
    }

    const locationRequestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = locationRequestVersion;

    reverseRequestRef.current?.abort();
    reverseRequestRef.current = null;

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (location) => {
        if (locationRequestVersion !== requestVersionRef.current) {
          return;
        }

        const newPosition = [
          location.coords.latitude,
          location.coords.longitude,
        ];

        setPosition(newPosition);
        reverseGeocode(newPosition[0], newPosition[1]);
      },
      () => {
        if (locationRequestVersion !== requestVersionRef.current) {
          return;
        }

        setLoading(false);
        setError(
          "Location permission was denied. You can move the pin manually."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="location-picker">
      <div className="location-map">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const location = event.target.getLatLng();

                handleLocationChange([location.lat, location.lng]);
              },
            }}
          />

          <MapClickHandler onLocationChange={handleLocationChange} />
          <RecenterMap position={position} />
        </MapContainer>
      </div>

      <div className="location-actions">
        <button
          type="button"
          className="location-current-button"
          onClick={useCurrentLocation}
          disabled={loading}
        >
          📍 {loading ? "Finding location..." : "Use My Current Location"}
        </button>
      </div>

      <p className="location-help">
        Drag the pin or click anywhere on the map to select your delivery
        location.
      </p>

      <div className="location-address">
        <label htmlFor="selected-address">Delivery Address</label>

        <textarea
          id="selected-address"
          value={address}
          onChange={(event) => {
            requestVersionRef.current += 1;
            reverseRequestRef.current?.abort();
            reverseRequestRef.current = null;

            setLoading(false);
            setError("");
            setAddress(event.target.value);
            onAddressChange(event.target.value);
          }}
          placeholder="Enter or edit your delivery address"
        />
      </div>

      {error && <div className="location-error">{error}</div>}
    </div>
  );
}

export default LocationPicker;
