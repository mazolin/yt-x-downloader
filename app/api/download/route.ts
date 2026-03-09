import { NextRequest, NextResponse } from "next/server";
import { exec } from "youtube-dl-exec";

const isTwitterUrl = (url: string) =>
  /https?:\/\/(www\.)?(twitter\.com|x\.com)/.test(url);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  let format = searchParams.get("format");
  const isAudio = searchParams.get("isAudio") === "true";

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  if (!format) {
    format = isAudio ? "bestaudio" : "best";
  }

  try {
    const opts: any = {
      f: format,
      output: "-", // output to stdout
      noCheckCertificates: true,
      noWarnings: true,
    };

    if (!isTwitterUrl(url)) {
      opts.addHeader = [
        "referer:youtube.com",
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ];
    }

    const subprocess = exec(url, opts as any);

    if (!subprocess.stdout) {
      throw new Error("Failed to get subprocess stdout");
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    subprocess.stdout.on("data", (chunk) => {
      writer.write(chunk);
    });

    subprocess.stdout.on("end", () => {
      writer.close();
    });

    subprocess.stdout.on("error", (err) => {
      writer.abort(err);
    });

    const fileExtension = isAudio ? "m4a" : "mp4"; // basic approximation
    const filename = `download-${Date.now()}.${fileExtension}`;

    return new NextResponse(readable, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error: any) {
    console.error("Error setting up download stream:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to setup download" },
      { status: 500 }
    );
  }
}
