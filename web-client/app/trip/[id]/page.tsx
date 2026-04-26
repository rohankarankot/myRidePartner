import type { Metadata } from "next";
import Link from "next/link";

type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const APP_SCHEME = "myridepartner://trip";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

type PublicTripResponse = {
  data: {
    documentId: string;
    description: string | null;
    startingPoint: string;
    destination: string;
    date: string;
    time: string;
    city: string | null;
    availableSeats: number;
    seatsBooked: number;
    seatsRemaining: number;
    pricePerSeat: string | number | null;
    isPriceCalculated: boolean;
    genderPreference: string;
    status: string;
    createdAt: string;
    creator: {
      id: number;
      username: string | null;
      fullName: string | null;
      avatar: string | null;
      city: string | null;
      rating: string | number | null;
      ratingsCount: number;
      completedTripsCount: number;
      governmentIdVerified: boolean;
    };
  };
};

async function getPublicTrip(id: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/public/trips/${encodeURIComponent(id)}`,
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicTripResponse;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: TripPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Trip ${id.slice(0, 8)} | My Ride Partner`,
    description:
      "Open this shared ride in My Ride Partner or continue on the web fallback page.",
  };
}

import TripDetailsContent from "./trip-details-content";

export default async function TripDetailsFallbackPage({
  params,
}: TripPageProps) {
  const { id } = await params;
  const appLink = `${APP_SCHEME}/${id}`;
  const tripResponse = await getPublicTrip(id);
  const trip = tripResponse?.data ?? null;

  return <TripDetailsContent trip={trip} id={id} appLink={appLink} />;
}
