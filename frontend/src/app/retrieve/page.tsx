"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Download, FileSearch, History, Link2 } from "lucide-react";
import toast from "react-hot-toast";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeCid } from "@/lib/cid";
import {
  buildShareLink,
  canPreviewMime,
  formatMetadataSize,
  formatUploadedAt,
  isImageMime,
  isPdfMime,
  isTextMime,
  isVideoMime,
  mergeHistoryEntry,
  parseRetrievalMetadata,
  RETRIEVAL_HISTORY_STORAGE_KEY,
  RETRIEVAL_METADATA_STORAGE_KEY,
  type RetrievalHistoryEntry,
  type RetrievalMetadata,
} from "@/lib/retrieve";

type RetrievalResult = {
  metadata: RetrievalMetadata;
  objectUrl: string;
  textPreview?: string;
};

function readStoredHistory(): RetrievalHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RETRIEVAL_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as RetrievalHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cacheMetadata(metadata: RetrievalMetadata) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(RETRIEVAL_METADATA_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, RetrievalMetadata>) : {};
    map[metadata.cid] = metadata;
    window.localStorage.setItem(RETRIEVAL_METADATA_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore cache write failures.
  }
}

export default function RetrievePage() {
  const searchParams = useSearchParams();

  const [cidInput, setCidInput] = useState("");
  const [cidError, setCidError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RetrievalResult | null>(null);
  const [history, setHistory] = useState<RetrievalHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readStoredHistory());
  }, []);

  useEffect(() => {
    return () => {
      if (result?.objectUrl) {
        URL.revokeObjectURL(result.objectUrl);
      }
    };
  }, [result]);

  useEffect(() => {
    const cidFromQuery = searchParams.get("cid");
    if (!cidFromQuery) {
      return;
    }

    setCidInput(cidFromQuery);
  }, [searchParams]);

  const persistHistory = (entries: RetrievalHistoryEntry[]) => {
    setHistory(entries);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(RETRIEVAL_HISTORY_STORAGE_KEY, JSON.stringify(entries));
    }
  };

  const handleRetrieve = async () => {
    const normalizedCid = await normalizeCid(cidInput);
    if (!normalizedCid) {
      setCidError("Invalid CID format");
      return;
    }

    setCidError(null);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/retrieve/${encodeURIComponent(normalizedCid)}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setErrorMessage(payload?.message ?? "Unable to retrieve file");
        return;
      }

      const blob = await response.blob();
      const metadata = parseRetrievalMetadata({
        cid: normalizedCid,
        headers: response.headers,
      });
      const objectUrl = URL.createObjectURL(blob);
      let textPreview: string | undefined;

      if (isTextMime(metadata.mimeType) && blob.size <= 1024 * 1024) {
        const text = await blob.text();
        textPreview = text.slice(0, 8000);
      }

      if (result?.objectUrl) {
        URL.revokeObjectURL(result.objectUrl);
      }

      const nextResult: RetrievalResult = {
        metadata,
        objectUrl,
        textPreview,
      };

      setResult(nextResult);
      cacheMetadata(metadata);

      const nextHistory = mergeHistoryEntry(history, {
        cid: metadata.cid,
        filename: metadata.filename,
        mimeType: metadata.mimeType,
        size: metadata.size,
        retrievedAt: new Date().toISOString(),
      });
      persistHistory(nextHistory);
    } catch {
      setErrorMessage("Unable to retrieve file right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLink = async () => {
    if (!result || typeof window === "undefined") {
      return;
    }

    const link = buildShareLink(window.location.origin, result.metadata.cid);

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const handleUseHistoryCid = (cid: string) => {
    setCidInput(cid);
    setCidError(null);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (!result) {
      return;
    }

    const link = document.createElement("a");
    link.href = result.objectUrl;
    link.download = result.metadata.filename;
    link.click();
  };

  const canPreview = result ? canPreviewMime(result.metadata.mimeType) : false;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Retrieve Files</h1>
          <p className="mt-1 text-sm text-slate-600">
            Fetch content from IPFS using CID with instant preview, metadata, and download tools.
          </p>
        </div>

        <Card className="space-y-4">
          <label className="block text-sm font-medium text-slate-800" htmlFor="cid-input">
            Enter CID
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              autoComplete="off"
              className="sm:flex-1"
              id="cid-input"
              onChange={(event) => {
                setCidInput(event.target.value);
                setCidError(null);
              }}
              placeholder="bafy..."
              value={cidInput}
            />
            <Button disabled={isLoading || !cidInput.trim()} onClick={() => void handleRetrieve()}>
              <FileSearch className="mr-2 h-4 w-4" />
              {isLoading ? "Retrieving..." : "Retrieve"}
            </Button>
          </div>
          {cidError ? <p className="text-sm text-red-600">{cidError}</p> : null}
          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        </Card>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">File Preview</h2>

            {!result ? <p className="text-sm text-slate-600">Retrieve a file to display preview and metadata.</p> : null}

            {result && canPreview && isImageMime(result.metadata.mimeType) ? (
              <img alt={result.metadata.filename} className="max-h-[420px] w-full rounded-md object-contain" src={result.objectUrl} />
            ) : null}

            {result && canPreview && isPdfMime(result.metadata.mimeType) ? (
              <iframe className="h-[420px] w-full rounded-md border border-slate-200" src={result.objectUrl} title="PDF preview" />
            ) : null}

            {result && canPreview && isTextMime(result.metadata.mimeType) ? (
              <pre className="max-h-[420px] overflow-auto rounded-md bg-slate-50 p-4 text-xs text-slate-800">
                {result.textPreview ?? "No preview available for this text file."}
              </pre>
            ) : null}

            {result && canPreview && isVideoMime(result.metadata.mimeType) ? (
              <div className="space-y-2">
                <video
                  className="max-h-[420px] w-full rounded-md border border-slate-200 bg-black"
                  controls
                  muted
                  onTimeUpdate={(event) => {
                    const video = event.currentTarget;
                    if (video.currentTime >= 5) {
                      video.currentTime = 0;
                      void video.play().catch(() => {
                        // Ignore autoplay/play promise errors in locked browser contexts.
                      });
                    }
                  }}
                  playsInline
                  src={result.objectUrl}
                />
                <p className="text-xs text-slate-600">Preview loop: first 5 seconds.</p>
              </div>
            ) : null}

            {result && !canPreview ? (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-700">
                Preview is not available for this file type. Use download to access the file.
              </p>
            ) : null}

            {result ? (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={() => void handleShareLink()} variant="ghost">
                  <Link2 className="mr-2 h-4 w-4" />
                  Share link
                </Button>
              </div>
            ) : null}
          </Card>

          <div className="space-y-6">
            <Card className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">File Information</h2>
              {!result ? <p className="text-sm text-slate-600">No file retrieved yet.</p> : null}
              {result ? (
                <dl className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-medium text-slate-900">CID</dt>
                    <dd className="break-all text-right">{result.metadata.cid}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-medium text-slate-900">Name</dt>
                    <dd className="text-right">{result.metadata.filename}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-medium text-slate-900">Size</dt>
                    <dd className="text-right">{formatMetadataSize(result.metadata.size)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-medium text-slate-900">Type</dt>
                    <dd className="text-right">{result.metadata.mimeType}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-medium text-slate-900">Uploaded</dt>
                    <dd className="text-right">{formatUploadedAt(result.metadata.uploadedAt)}</dd>
                  </div>
                </dl>
              ) : null}
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Recent retrievals</h2>
              </div>
              {history.length === 0 ? <p className="text-sm text-slate-600">No retrievals yet in this browser session.</p> : null}
              {history.length > 0 ? (
                <ul className="space-y-2">
                  {history.map((entry) => (
                    <li className="rounded-md border border-slate-200 p-3" key={entry.cid}>
                      <p className="truncate text-sm font-medium text-slate-900">{entry.filename}</p>
                      <p className="truncate text-xs text-slate-600">{entry.cid}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">{formatUploadedAt(entry.retrievedAt)}</span>
                        <Button className="h-8 px-2 text-xs" onClick={() => handleUseHistoryCid(entry.cid)} variant="ghost">
                          <Copy className="mr-1 h-3 w-3" />
                          Use CID
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
