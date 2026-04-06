import { NextResponse } from "next/server";

const iosBundleId =
  process.env.IOS_BUNDLE_ID ?? "com.rohankarankot.myridepartner";
const appleTeamId = process.env.APPLE_TEAM_ID;

export function GET() {
  if (!appleTeamId) {
    return NextResponse.json(
      {
        error:
          "APPLE_TEAM_ID is not configured. Set it before using Universal Links in production.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: `${appleTeamId}.${iosBundleId}`,
            paths: ["/trip/*"],
          },
        ],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
