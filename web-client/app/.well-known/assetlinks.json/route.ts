import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.rohanalwayscodes.myridepartner",
          sha256_cert_fingerprints: [
            "A2:3E:16:AE:46:AF:81:F0:5F:AC:9E:EC:88:8E:F9:D1:1E:36:52:23:B3:4C:1B:C2:09:7A:22:49:1E:7F:58:A3",
          ],
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
