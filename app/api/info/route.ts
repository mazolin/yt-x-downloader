import { NextRequest, NextResponse } from "next/server";
import youtubedl from "youtube-dl-exec";

const isTwitterUrl = (url: string) =>
  /https?:\/\/(www\.)?(twitter\.com|x\.com)/.test(url);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const options: any = {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    };

    if (!isTwitterUrl(url)) {
      options.addHeader = [
        "referer:youtube.com",
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ];
    }

    const info = await youtubedl(url, options);

    return NextResponse.json({ success: true, info });
  } catch (error: any) {
    console.error("Error fetching video info properties:", Object.keys(error));
    console.error("Error fetching video info:", error.message);
    if (error.stderr) console.error("STDERR:", error.stderr);
    
    return NextResponse.json(
      { success: false, error: error.stderr || error.message || "Failed to fetch video info" },
      { status: 500 }
    );
  }
}
