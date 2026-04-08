import { CONFIG } from '@/constants/config';

const OLA_AUTOCOMPLETE_URL = 'https://api.olamaps.io/places/v1/autocomplete';

export interface OlaPlaceSuggestion {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

type OlaAutocompletePrediction = {
  place_id?: string;
  description?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
  geometry?: {
    location?: {
      lat?: number | string;
      lng?: number | string;
    };
  };
  position?: {
    lat?: number | string;
    lng?: number | string;
  };
};

const parseCoordinate = (value: number | string | undefined): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const next = Number(value);
    return Number.isFinite(next) ? next : undefined;
  }

  return undefined;
};

const normalizePrediction = (prediction: OlaAutocompletePrediction, index: number): OlaPlaceSuggestion | null => {
  const title = prediction.structured_formatting?.main_text?.trim()
    || prediction.description?.split(',')[0]?.trim()
    || '';
  const subtitle = prediction.structured_formatting?.secondary_text?.trim()
    || prediction.description?.trim()
    || '';
  const address = prediction.description?.trim() || subtitle || title;

  if (!address) {
    return null;
  }

  return {
    id: prediction.place_id || `${address}-${index}`,
    title: title || address,
    subtitle: subtitle && subtitle !== title ? subtitle : address,
    address,
    latitude: parseCoordinate(prediction.geometry?.location?.lat ?? prediction.position?.lat),
    longitude: parseCoordinate(prediction.geometry?.location?.lng ?? prediction.position?.lng),
  };
};

export const olaPlacesService = {
  async autocomplete(input: string, signal?: AbortSignal): Promise<OlaPlaceSuggestion[]> {
    const query = input.trim();

    if (!query) {
      return [];
    }

    if (!CONFIG.OLA_MAPS_API_KEY) {
      throw new Error('Ola Maps API key is missing.');
    }

    const url = new URL(OLA_AUTOCOMPLETE_URL);
    url.searchParams.set('input', query);
    url.searchParams.set('api_key', CONFIG.OLA_MAPS_API_KEY);

    const response = await fetch(url.toString(), {
      method: 'GET',
      signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ola Maps autocomplete failed with status ${response.status}.`);
    }

    const payload = await response.json();
    const predictions = Array.isArray(payload?.predictions)
      ? payload.predictions
      : Array.isArray(payload?.results)
        ? payload.results
        : [];

    return predictions
      .map((prediction: OlaAutocompletePrediction, index: number) => normalizePrediction(prediction, index))
      .filter((prediction: OlaPlaceSuggestion | null): prediction is OlaPlaceSuggestion => prediction !== null);
  },
};
