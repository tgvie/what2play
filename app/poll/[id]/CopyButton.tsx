"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Copy button -> copy URL to clipboard with feedback
export default function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="cursor-pointer flex shrink-0 items-center gap-1.5 rounded-lg bg-pink px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-pink-light focus:outline-none focus:ring-2 focus:ring-pink/50"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy
        </>
      )}
    </button>
  );
}
