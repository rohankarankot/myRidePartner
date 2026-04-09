import React, { useMemo } from 'react';
import { View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { CONFIG } from '@/constants/config';
import type { LocationCoordinate } from '@/features/trips/types/location';

type OlaMapViewProps = {
  borderColor: string;
  centerCoordinate?: LocationCoordinate | null;
  currentLocationCoordinate?: LocationCoordinate | null;
  fromCoordinate?: LocationCoordinate | null;
  height?: number;
  interactive?: boolean;
  onMapPress?: (coordinate: LocationCoordinate) => void;
  previewLabel?: string;
  primaryColor: string;
  textColor: string;
  toCoordinate?: LocationCoordinate | null;
};

const DEFAULT_CENTER: LocationCoordinate = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const buildMarkerScript = (
  coordinate: LocationCoordinate | null | undefined,
  color: string,
  label: string,
  kind: 'default' | 'current' = 'default'
) => {
  if (!coordinate) {
    return 'null';
  }

  return JSON.stringify({
    color,
    kind,
    label,
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
  });
};

const buildHtml = ({
  centerCoordinate,
  currentLocationCoordinate,
  fromCoordinate,
  interactive,
  primaryColor,
  toCoordinate,
}: {
  centerCoordinate?: LocationCoordinate | null;
  currentLocationCoordinate?: LocationCoordinate | null;
  fromCoordinate?: LocationCoordinate | null;
  interactive: boolean;
  primaryColor: string;
  toCoordinate?: LocationCoordinate | null;
}) => {
  const fallbackCenter = currentLocationCoordinate ?? fromCoordinate ?? toCoordinate ?? centerCoordinate ?? DEFAULT_CENTER;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <style>
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f6f7f8;
        overflow: hidden;
      }

      .pin {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 3px solid #ffffff;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.22);
        position: relative;
      }

      .pin.current {
        width: 20px;
        height: 20px;
        background: #2563eb !important;
        box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.18);
      }

      .pin.current::after {
        content: '';
        position: absolute;
        inset: -10px;
        border-radius: 999px;
        border: 2px solid rgba(37, 99, 235, 0.45);
        animation: pulse 1.8s ease-out infinite;
      }

      @keyframes pulse {
        0% {
          transform: scale(0.7);
          opacity: 1;
        }
        100% {
          transform: scale(1.6);
          opacity: 0;
        }
      }

    </style>
    <script src="https://www.unpkg.com/olamaps-web-sdk@latest/dist/olamaps-web-sdk.umd.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const fallbackCenter = ${JSON.stringify([fallbackCenter.longitude, fallbackCenter.latitude])};
      const currentLocationPoint = ${buildMarkerScript(currentLocationCoordinate, '#2563eb', 'Current Location', 'current')};
      const fromPoint = ${buildMarkerScript(fromCoordinate, '#16a34a', 'Pickup')};
      const toPoint = ${buildMarkerScript(toCoordinate, '#dc2626', 'Drop')};
      const interactive = ${interactive ? 'true' : 'false'};
      const olaMaps = new OlaMaps({ apiKey: ${JSON.stringify(CONFIG.OLA_MAPS_API_KEY)} });

      let map;
      let currentLocationMarker = null;
      let fromMarker = null;
      let toMarker = null;
      let selectedMarker = null;
      let selectionMarker = null;
      const routeId = 'trip-route-line';

      function createMarker(point) {
        const el = document.createElement('div');
        el.className = point.kind === 'current' ? 'pin current' : 'pin';
        el.style.background = point.color;
        return olaMaps.addMarker({ element: el, anchor: 'center' })
          .setLngLat([point.longitude, point.latitude]);
      }

      function syncMarker(currentMarker, point) {
        if (!point) {
          if (currentMarker) {
            currentMarker.remove();
          }
          return null;
        }

        if (!currentMarker) {
          return createMarker(point).addTo(map);
        }

        currentMarker.setLngLat([point.longitude, point.latitude]);
        return currentMarker;
      }

      function focusMap() {
        if (currentLocationPoint) {
          map.flyTo({
            center: [currentLocationPoint.longitude, currentLocationPoint.latitude],
            zoom: 17,
            speed: 1.2,
            curve: 1.3,
            essential: true,
          });
          return;
        }

        const points = [fromPoint, toPoint].filter(Boolean);
        if (interactive && selectedMarker) {
          points.push(selectedMarker);
        }

        if (points.length >= 2) {
          const bounds = points.reduce((acc, point) => {
            acc.extend([point.longitude, point.latitude]);
            return acc;
          }, new OlaMaps.LngLatBounds([points[0].longitude, points[0].latitude], [points[0].longitude, points[0].latitude]));
          map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 500 });
          return;
        }

        const focus = points[0];
        if (focus) {
          map.flyTo({ center: [focus.longitude, focus.latitude], zoom: 15, duration: 500 });
        }
      }

      function renderRouteLine() {
        if (!fromPoint || !toPoint) {
          return;
        }

        const routeFeature = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [fromPoint.longitude, fromPoint.latitude],
              [toPoint.longitude, toPoint.latitude],
            ],
          },
        };

        if (map.getSource(routeId)) {
          map.getSource(routeId).setData(routeFeature);
          return;
        }

        map.addSource(routeId, {
          type: 'geojson',
          data: routeFeature,
        });

        map.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': ${JSON.stringify(primaryColor)},
            'line-width': 5,
            'line-opacity': 0.9,
          },
        });
      }

      function postMessage(type, payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
        }
      }

      async function init() {
        map = await olaMaps.init({
          style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
          container: 'map',
          center: fallbackCenter,
          zoom: fromPoint || toPoint ? 14 : 11,
        });

        currentLocationMarker = syncMarker(currentLocationMarker, currentLocationPoint);
        fromMarker = syncMarker(fromMarker, fromPoint);
        toMarker = syncMarker(toMarker, toPoint);
        selectionMarker = syncMarker(selectionMarker, null);
        renderRouteLine();
        focusMap();

        if (interactive) {
          map.on('click', (event) => {
            selectedMarker = {
              color: ${JSON.stringify(primaryColor)},
              label: 'Selected point',
              latitude: event.lngLat.lat,
              longitude: event.lngLat.lng,
            };
            selectionMarker = syncMarker(selectionMarker, selectedMarker);
            focusMap();
            postMessage('map-press', selectedMarker);
          });
        }
      }

      init().catch((error) => {
        postMessage('map-error', { message: error && error.message ? error.message : 'Unable to load Ola map.' });
      });
    </script>
  </body>
</html>`;
};

export function OlaMapView({
  borderColor,
  centerCoordinate,
  currentLocationCoordinate,
  fromCoordinate,
  height = 220,
  interactive = false,
  onMapPress,
  previewLabel,
  primaryColor,
  textColor,
  toCoordinate,
}: OlaMapViewProps) {
  const html = useMemo(
    () => buildHtml({
      centerCoordinate,
      currentLocationCoordinate,
      fromCoordinate,
      interactive,
      primaryColor,
      toCoordinate,
    }),
    [centerCoordinate, currentLocationCoordinate, fromCoordinate, interactive, primaryColor, toCoordinate]
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    if (!onMapPress) {
      return;
    }

    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (
        message?.type === 'map-press'
        && message.payload?.latitude != null
        && message.payload?.longitude != null
      ) {
        onMapPress({
          latitude: Number(message.payload.latitude),
          longitude: Number(message.payload.longitude),
        });
      }
    } catch {
      // Ignore malformed bridge messages from the embedded map.
    }
  };

  if (!CONFIG.OLA_MAPS_API_KEY) {
    return (
      <Box
        className="rounded-[24px] border px-4 py-5"
        style={{ borderColor }}
      >
        <Text className="text-sm font-semibold" style={{ color: textColor }}>
          Add `EXPO_PUBLIC_OLA_MAPS_API_KEY` to render the Ola map preview.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {previewLabel ? (
        <Text className="mb-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
          {previewLabel}
        </Text>
      ) : null}
      <View
        style={{
          height,
          overflow: 'hidden',
          borderColor,
          borderRadius: 24,
          borderWidth: 1,
        }}
      >
        <WebView
          key={html}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          setSupportMultipleWindows={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Box>
  );
}
