import React, { useState } from "react";
import exifr from "exifr";

const ExifReader: React.FC = () => {
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(null);
    setError(null);

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Extract EXIF including GPS
      const tags = await exifr.parse(file, { gps: true });
      if (tags && tags.latitude && tags.longitude) {
        // Reverse geocode using OpenStreetMap (Nominatim API)
        const lat = tags.latitude;
        const lon = tags.longitude;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await res.json();

        if (data && data.display_name) {
          setLocation(data.display_name);
        } else {
          setError("Unable to resolve location from coordinates.");
        }
      } else {
        setError("No GPS data found in this image.");
      }
    } catch (err) {
      setError("Failed to read EXIF data.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📍 Image Location Finder</h2>
      <input type="file" accept="image/jpeg" onChange={handleFile} />
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {location && (
        <div style={{ marginTop: "20px", color: "green" }}>
          <strong>Detected Location:</strong> {location}
        </div>
      )}
    </div>
  );
};

export default ExifReader;
