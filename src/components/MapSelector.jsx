import React, { useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow,
  Polyline
} from "@react-google-maps/api";
import axios from "axios";
import { debounce } from "lodash";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  margin: "20px 0",
  backgroundColor: "#fff",
};

const defaultCenter = {
  lat: 11.0168,
  lng: 76.9558,
};

function MapSelector({ from, to, userLocation }) {
  const [directions, setDirections] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [pathHistory, setPathHistory] = useState([]);
  const [trafficLayer, setTrafficLayer] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(12);
  const [center, setCenter] = useState(defaultCenter);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [busIcon, setBusIcon] = useState(null);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);

  const geocodeAddress = useCallback((address, setter) => {
    if (!window.google?.maps?.Geocoder || !address) return;
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        setter({ lat: location.lat(), lng: location.lng() });
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof from === "string") {
      geocodeAddress(from, setFromCoords);
    } else if (typeof from === "object" && from.lat && from.lng) {
      setFromCoords(from);
    }

    if (typeof to === "string") {
      geocodeAddress(to, setToCoords);
    } else if (typeof to === "object" && to.lat && to.lng) {
      setToCoords(to);
    }
  }, [from, to, geocodeAddress]);

  const onLoad = useCallback((map) => {
    setMap(map);
    setIsMapLoaded(true);

    if (window.google && window.google.maps) {
      const traffic = new window.google.maps.TrafficLayer();
      traffic.setMap(map);
      setTrafficLayer(traffic);

      setBusIcon({
        url: "https://cdn-icons-png.flaticon.com/512/477/477103.png",
        scaledSize: new window.google.maps.Size(40, 40),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(20, 20),
      });
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setIsMapLoaded(false);
  }, []);

  const getDirections = useCallback(debounce(async () => {
    if (!window.google || !fromCoords || !toCoords) return;

    try {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: fromCoords,
          destination: toCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: 'bestguess'
          },
          unitSystem: window.google.maps.UnitSystem.METRIC
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
            if (result.routes[0]?.legs[0]) {
              setEta(result.routes[0].legs[0].duration.text);
              setDistance(result.routes[0].legs[0].distance.text);
            }
          }
        }
      );
    } catch (err) {
      console.error("Directions error:", err);
    }
  }, 500), [fromCoords, toCoords]);

  useEffect(() => {
    getDirections();
  }, [fromCoords, toCoords, getDirections]);

  useEffect(() => {
    let isMounted = true;
    const fetchLocation = async () => {
      try {
        const response = await axios.get("http://121.0.0.1:5000/api/location");
        if (isMounted && response.data?.latitude && response.data?.longitude) {
          const newLocation = {
            lat: response.data.latitude,
            lng: response.data.longitude,
            timestamp: new Date().toISOString()
          };
          setBusLocation(newLocation);
          setPathHistory(prev => [...prev.slice(-50), newLocation]);

          if (map && pathHistory.length > 0 && window.google?.maps) {
            const lastLocation = pathHistory[pathHistory.length - 1];
            const distanceMoved = window.google.maps.geometry.spherical.computeDistanceBetween(
              new window.google.maps.LatLng(lastLocation.lat, lastLocation.lng),
              new window.google.maps.LatLng(newLocation.lat, newLocation.lng)
            );
            if (distanceMoved > 50) {
              setCenter(newLocation);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching location:", err);
      }
    };

    const interval = setInterval(fetchLocation, 3000);
    fetchLocation();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [map, pathHistory]);

  useEffect(() => {
    if (!map || !directions || !busLocation || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();

    directions.routes[0].legs.forEach(leg => {
      bounds.extend(leg.start_location);
      bounds.extend(leg.end_location);
    });

    bounds.extend(new window.google.maps.LatLng(busLocation.lat, busLocation.lng));

    if (userLocation) {
      bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
    }

    map.fitBounds(bounds);

    const zoomListener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      if (map.getZoom() > 16) {
        map.setZoom(16);
      }
    });

    return () => {
      window.google.maps.event.removeListener(zoomListener);
    };
  }, [map, directions, busLocation, userLocation]);

  return (
    <div style={{ position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          clickableIcons: false,
          styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }]
        }}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#4285F4",
                strokeWeight: 5,
                strokeOpacity: 0.7
              },
              preserveViewport: true
            }}
          />
        )}

        {fromCoords && (
          <Marker
            position={fromCoords}
            label="A"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}

        {toCoords && (
          <Marker
            position={toCoords}
            label="B"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}

        {userLocation && (
          <Marker
            position={userLocation}
            onClick={() => setSelectedMarker({ type: 'user', location: userLocation })}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          />
        )}

        {busLocation && busIcon && (
          <Marker
            position={busLocation}
            onClick={() => setSelectedMarker({ type: 'bus', location: busLocation })}
            icon={busIcon}
          />
        )}

        {pathHistory.length > 1 && (
          <Polyline
            path={pathHistory.map(loc => ({ lat: loc.lat, lng: loc.lng }))}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.5,
              strokeWeight: 3,
              geodesic: true
            }}
          />
        )}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.location}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: '8px' }}>
              <h3>{selectedMarker.type === 'bus' ? 'Bus Location' : 'Your Location'}</h3>
              <p>Lat: {selectedMarker.location.lat.toFixed(6)}</p>
              <p>Lng: {selectedMarker.location.lng.toFixed(6)}</p>
              {selectedMarker.type === 'bus' && busLocation.timestamp && (
                <p>Last update: {new Date(busLocation.timestamp).toLocaleTimeString()}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Route Info:</strong>
          {eta && distance ? (
            <>
              <div>Distance: {distance}</div>
              <div>ETA: {eta}</div>
            </>
          ) : (
            <div>Calculating route...</div>
          )}
        </div>
        <button
          onClick={() => {
            if (map && busLocation) {
              map.panTo(busLocation);
              setZoom(16);
            }
          }}
          style={{
            padding: '6px 10px',
            marginRight: '8px',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Center on Bus
        </button>
        <button
          onClick={() => {
            if (map && directions) {
              const bounds = new window.google.maps.LatLngBounds();
              directions.routes[0].legs.forEach(leg => {
                bounds.extend(leg.start_location);
                bounds.extend(leg.end_location);
              });
              map.fitBounds(bounds);
            }
          }}
          style={{
            padding: '6px 10px',
            backgroundColor: '#34A853',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Show Full Route
        </button>
      </div>
    </div>
  );
}

export default React.memo(MapSelector);
