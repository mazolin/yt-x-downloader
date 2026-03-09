"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Search, Loader2, Music, Video, AlertCircle, Youtube, Twitter } from "lucide-react";

type Platform = "youtube" | "twitter" | "unknown";

function detectPlatform(url: string): Platform {
  if (/https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url)) return "youtube";
  if (/https?:\/\/(www\.)?(twitter\.com|x\.com)/.test(url)) return "twitter";
  return "unknown";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [platform, setPlatform] = useState<Platform>("unknown");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError(null);
    setInfo(null);
    setPlatform("unknown");
    
    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch video details");
      }
      
      setInfo(data.info);
      setPlatform(detectPlatform(url));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (formatId: string, isAudio: boolean = false) => {
    window.location.href = `/api/download?url=${encodeURIComponent(info?.webpage_url || url)}&format=${formatId}&isAudio=${isAudio}`;
  };

  // For YouTube: separate video and audio streams
  const videoFormats = info?.formats
    ?.filter((f: any) => f.vcodec !== "none" && f.vcodec !== null && f.ext === "mp4")
    .reduce((acc: any[], current: any) => {
      const x = acc.find(item => item.height === current.height);
      if (!x && current.height >= 360) return acc.concat([current]);
      return acc;
    }, [])
    .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))
    .slice(0, 5);

  const audioFormats = info?.formats
    ?.filter((f: any) => f.acodec !== "none" && f.acodec !== null && f.vcodec === "none")
    .sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))
    .slice(0, 3);

  // For Twitter: formats are usually merged (video+audio combined)
  const twitterFormats = info?.formats
    ?.filter((f: any) => f.vcodec !== "none" && f.vcodec !== null && f.acodec !== "none")
    .reduce((acc: any[], current: any) => {
      if (!current.height) return acc;
      const x = acc.find(item => item.height === current.height);
      if (!x) return acc.concat([current]);
      return acc;
    }, [])
    .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))
    .slice(0, 5);

  const isTwitter = platform === "twitter";

  const PlatformIcon = isTwitter ? Twitter : Youtube;
  const iconColor = isTwitter ? "text-sky-400" : "text-red-500";
  const gradientFrom = isTwitter ? "from-sky-500/30" : "from-purple-500/30";
  const gradientTo = isTwitter ? "to-cyan-500/30" : "to-pink-500/30";
  const accentColor = isTwitter ? "text-sky-300" : "text-indigo-300";
  const accentBg = isTwitter ? "bg-sky-500/20" : "bg-indigo-500/20";

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-64 h-64 bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 flex flex-col gap-8 items-center">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 p-3 sm:p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl mb-2">
            <Youtube className="w-9 h-9 sm:w-11 sm:h-11 text-red-500" />
            <span className="text-white/30 text-2xl font-light">+</span>
            <Twitter className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            Video Downloader
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto font-medium">
            Download videos from <span className="text-red-400 font-semibold">YouTube</span> and <span className="text-sky-400 font-semibold">Twitter / X</span> in stunning quality. Free, fast, and beautiful.
          </p>
        </div>

        {/* Platform Badges */}
        <div className="flex gap-3 flex-wrap justify-center -mt-4">
          <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Youtube className="w-3.5 h-3.5" /> YouTube
          </span>
          <span className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Twitter className="w-3.5 h-3.5" /> Twitter / X
          </span>
        </div>

        {/* Input Form Section */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
          <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500`}></div>
          <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 p-2 sm:p-3 rounded-2xl shadow-2xl overflow-hidden transition-all hover:border-white/20">
            <div className="pl-4 pr-3 text-white/50">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube or Twitter/X video link here..."
              className="flex-1 bg-transparent border-none outline-none text-white text-base sm:text-lg placeholder-white/40 focus:ring-0"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="ml-2 bg-white text-black font-semibold rounded-xl px-4 sm:px-6 py-2 sm:py-3 transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">Searching</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 text-red-200 backdrop-blur-md px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <p className="text-sm sm:text-base font-medium">{error}</p>
          </div>
        )}

        {/* Info & Download Section */}
        {info && (
          <div className="w-full mt-4 flex flex-col md:flex-row gap-6 items-start animate-in fade-in slide-in-from-bottom-8">
            
            {/* Video Thumbnail and Title */}
            <div className="w-full md:w-5/12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0">
              <div className="relative aspect-video w-full bg-black/50">
                <Image
                  src={info.thumbnail || "/api/placeholder/640/360"}
                  alt={info.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Platform badge on thumbnail */}
                <div className={`absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-md bg-black/60 ${iconColor}`}>
                  <PlatformIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold text-white">{isTwitter ? "Twitter / X" : "YouTube"}</span>
                </div>
                {info.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white">
                    {Math.floor(info.duration / 60)}:{(info.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-tight">
                  {info.title}
                </h2>
                <div className="flex items-center gap-2 mt-3 text-white/60 text-sm flex-wrap">
                  <span className="font-medium bg-white/10 px-2 py-0.5 rounded-full">{info.uploader || info.channel || "Unknown"}</span>
                  {typeof info.view_count === "number" && (
                    <>
                      <span>•</span>
                      <span>{new Intl.NumberFormat('en-US').format(info.view_count)} views</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Formats Selection */}
            <div className="w-full md:w-7/12 flex flex-col gap-4">
              
              {/* Twitter: merged formats */}
              {isTwitter ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4 text-white/90">
                    <Video className="w-5 h-5 text-sky-400" />
                    <h3 className="text-lg font-semibold">Video Formats</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownload("best", false)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">Auto (Best Quality)</span>
                        <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md">Recommended</span>
                      </div>
                      <Download className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                    </button>
                    {twitterFormats?.map((f: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleDownload(f.format_id, false)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-white">{f.height ? `${f.height}p` : f.format_note || f.format_id}</span>
                          <span className="text-xs text-white/50">{f.ext?.toUpperCase()}</span>
                          {f.filesize && (
                            <span className="text-xs text-white/40">
                              {(f.filesize / 1024 / 1024).toFixed(1)} MB
                            </span>
                          )}
                        </div>
                        <Download className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                    {(!twitterFormats || twitterFormats.length === 0) && (
                      <div className="p-3 text-sm text-white/50 text-center">No specific formats found. Use Auto.</div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* YouTube: separate video and audio formats */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4 text-white/90">
                      <Video className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-lg font-semibold">Video Formats</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleDownload("best", false)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-white">Auto (Best Quality)</span>
                          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md">Recommended</span>
                        </div>
                        <Download className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                      </button>
                      {videoFormats?.map((f: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleDownload(f.format_id, false)}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors group"
                        >
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium text-white">{f.height}p</span>
                            <span className="text-xs text-white/50">{f.ext.toUpperCase()}</span>
                            {f.filesize && (
                              <span className="text-xs text-white/40">
                                {(f.filesize / 1024 / 1024).toFixed(1)} MB
                              </span>
                            )}
                          </div>
                          <Download className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                        </button>
                      ))}
                      {(!videoFormats || videoFormats.length === 0) && (
                        <div className="p-3 text-sm text-white/50 text-center">No specific video formats found. Use Auto.</div>
                      )}
                    </div>
                  </div>

                  {/* Audio Formats Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4 text-white/90">
                      <Music className="w-5 h-5 text-pink-400" />
                      <h3 className="text-lg font-semibold">Audio Only</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleDownload("bestaudio", true)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-white">Auto (Best Audio)</span>
                        </div>
                        <Download className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                      </button>
                      {audioFormats?.map((f: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleDownload(f.format_id, true)}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors group"
                        >
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium text-white">{f.ext.toUpperCase()} Audio</span>
                            <span className="text-xs text-white/50">~{Math.round(f.abr || 128)} kbps</span>
                            {f.filesize && (
                              <span className="text-xs text-white/40">
                                {(f.filesize / 1024 / 1024).toFixed(1)} MB
                              </span>
                            )}
                          </div>
                          <Download className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>

          </div>
        )}
      </div>
    </main>
  );
}
