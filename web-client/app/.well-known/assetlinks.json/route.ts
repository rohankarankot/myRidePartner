import { NextResponse } from "next/server";

const androidPackageName =
  process.env.ANDROID_PACKAGE_NAME ?? "com.rohankarankot.myridepartner";
const androidSha256Fingerprint =
  process.env.ANDROID_SHA256_FINGERPRINT ??
  "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C";

export function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: androidPackageName,
          sha256_cert_fingerprints: [androidSha256Fingerprint],
        },
      },
    ],
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
