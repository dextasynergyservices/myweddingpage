"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Upload, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface CardData {
  coupleName: string;
  weddingDate: string;
  message: string;
  qrCodeUrl?: string | null;
  colors: { primary: string; secondary: string };
}

interface Props {
  streamId: string;
  weddingPageUrl: string;
}

export default function InvitationCardDesigner({ streamId, weddingPageUrl }: Props) {
  const { isDarkMode } = useTheme();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [useWeddingCard, setUseWeddingCard] = useState(false);
  const [weddingCardImage, setWeddingCardImage] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#EC4899");
  const [showQRCode, setShowQRCode] = useState(true);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setWeddingCardImage(String(reader.result));
    reader.readAsDataURL(f);
    setUseWeddingCard(true);
  };

  const removeImage = () => {
    setWeddingCardImage(null);
    setUseWeddingCard(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const generateCard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invitation-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId,
          template: useWeddingCard ? "custom" : "elegant",
          primaryColor,
          secondaryColor,
          showQRCode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCardData(data.cardData || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async () => {
    const el = document.getElementById("invitation-card");
    if (!el) return;
    // Helper: compute readable text color (black/white) from a hex background
    const getReadableTextColor = (hex: string) => {
      try {
        const h = hex.replace("#", "");
        const r = parseInt(h.substring(0, 2), 16) / 255;
        const g = parseInt(h.substring(2, 4), 16) / 255;
        const b = parseInt(h.substring(4, 6), 16) / 255;
        // linearized luminance
        const lr = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const lg = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const lb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        const lum = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
        return lum > 0.5 ? "#000000" : "#ffffff";
      } catch {
        return "#ffffff";
      }
    };

    // Inject temporary safe overrides to avoid html2canvas parsing 'oklab' / 'color-mix' functions
    const injectSafeOverrides = () => {
      const style = document.createElement("style");
      const textColor = getReadableTextColor(primaryColor || "#4F46E5");
      const safeRules = `
        /* Temporary overrides for html2canvas capture */
        #invitation-card, #invitation-card * {
          background-image: none !important;
          background: transparent !important;
          background-color: transparent !important;
          color: ${textColor} !important;
          border-color: ${primaryColor} !important;
          box-shadow: none !important;
          filter: none !important;
          mix-blend-mode: normal !important;
        }
        #invitation-card { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}) !important; }
        #invitation-card img { image-rendering: auto !important; }
      `;
      style.setAttribute("data-invitation-capture", "1");
      style.appendChild(document.createTextNode(safeRules));
      document.head.appendChild(style);
      return style;
    };

    // Preferred approach: clone the element and inline computed styles onto the clone.
    // This prevents html2canvas from parsing stylesheet declarations containing unsupported functions like 'oklab'.
    const cloneAndInline = (orig: HTMLElement) => {
      const clone = orig.cloneNode(true) as HTMLElement;

      const origNodes = [orig, ...Array.from(orig.querySelectorAll<HTMLElement>("*"))];
      const cloneNodes = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];

      for (let i = 0; i < origNodes.length; i++) {
        const o = origNodes[i];
        const c = cloneNodes[i];
        try {
          const cs = window.getComputedStyle(o);
          // Copy computed styles
          for (let j = 0; j < cs.length; j++) {
            const prop = cs[j];
            const val = cs.getPropertyValue(prop);
            const prio = cs.getPropertyPriority(prop);
            try {
              c.style.setProperty(prop, val, prio);
            } catch {
              // ignore properties that can't be set
            }
          }
        } catch {
          // ignore compute errors
        }

        // Preserve input/textarea values
        if (o instanceof HTMLTextAreaElement && c instanceof HTMLTextAreaElement) c.value = o.value;
        if (o instanceof HTMLInputElement && c instanceof HTMLInputElement) c.value = o.value;
      }

      return clone;
    };

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0";
    wrapper.style.width = `${el.getBoundingClientRect().width}px`;

    const cloned = cloneAndInline(el);
    wrapper.appendChild(cloned);
    document.body.appendChild(wrapper);

    // inject safe overrides for problematic CSS functions
    const overrideEl = injectSafeOverrides();

    try {
      const canvas = await html2canvas(cloned, { scale: 2, useCORS: true, backgroundColor: null });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "wedding-invitation.png";
      a.click();
    } catch (err) {
      console.error("Error capturing invitation card:", err);
      // Fallback: try disabling stylesheets then capture original element
      const disabledSheets: CSSStyleSheet[] = [];
      const disableProblematic = () => {
        for (const ss of Array.from(document.styleSheets) as CSSStyleSheet[]) {
          try {
            let found = false;
            try {
              const cssText = Array.from(ss.cssRules || [])
                .map((r: CSSRule) => r.cssText)
                .join(" ");
              if (cssText.includes("oklab") || cssText.includes("color-mix")) found = true;
            } catch {
              // cross-origin or inaccessible
            }
            if (found) {
              try {
                (ss as CSSStyleSheet & { disabled: boolean }).disabled = true;
                disabledSheets.push(ss);
              } catch {
                // ignore
              }
            }
          } catch {
            // ignore
          }
        }
      };

      const enableDisabled = () => {
        for (const ss of disabledSheets) {
          try {
            (ss as CSSStyleSheet & { disabled: boolean }).disabled = false;
          } catch {
            // ignore
          }
        }
      };

      try {
        disableProblematic();
        const canvas = await html2canvas(el, { scale: 1, useCORS: true, backgroundColor: null });
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "wedding-invitation.png";
        a.click();
      } catch (err2) {
        console.error("Fallback capture failed:", err2);
      } finally {
        enableDisabled();
      }
    } finally {
      // clean-up: remove injected override and off-screen wrapper
      try {
        if (overrideEl && overrideEl.parentNode) overrideEl.parentNode.removeChild(overrideEl);
      } catch {
        // ignore
      }
      document.body.removeChild(wrapper);
    }
  };

  const shareTextOnly = () => {
    if (!cardData) return;
    const text = `${cardData.coupleName}\n\n${cardData.message}\n\nJoin us: ${weddingPageUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadAndShareToWhatsApp = async () => {
    await downloadCard();
    setTimeout(() => shareTextOnly(), 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-6 shadow ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>
        Invitation Card Designer
      </h3>

      <div className="space-y-4">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            Use your wedding card (optional)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="card-upload"
          />
          <label
            htmlFor="card-upload"
            className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-black"}`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Upload image</span>
          </label>
          {weddingCardImage && (
            <div className="mt-2 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={weddingCardImage} alt="wedding" className="w-full rounded" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs mb-1 ${isDarkMode ? "text-white" : "text-black"}`}>
              Primary
            </label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full h-9 rounded"
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${isDarkMode ? "text-white" : "text-black"}`}>
              Secondary
            </label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-full h-9 rounded"
            />
          </div>
        </div>

        {weddingCardImage && (
          <div className="flex items-center gap-3 mt-2">
            <input
              id="use-uploaded"
              type="checkbox"
              checked={useWeddingCard}
              onChange={(e) => setUseWeddingCard(e.target.checked)}
            />
            <label
              htmlFor="use-uploaded"
              className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}
            >
              Use uploaded image as invitation background
            </label>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            id="show-qr"
            type="checkbox"
            checked={showQRCode}
            onChange={(e) => setShowQRCode(e.target.checked)}
          />
          <label
            htmlFor="show-qr"
            className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}
          >
            Include QR code
          </label>
        </div>

        <button
          onClick={generateCard}
          disabled={loading}
          className="w-full rounded bg-purple-600 text-white px-4 py-2"
        >
          {loading ? "Generating..." : "Generate Card"}
        </button>

        {cardData && (
          <div>
            <div
              id="invitation-card"
              className="mx-auto w-full max-w-[420px] rounded overflow-hidden shadow"
              style={{
                background:
                  useWeddingCard && weddingCardImage
                    ? "transparent"
                    : `linear-gradient(135deg, ${cardData.colors.primary}, ${cardData.colors.secondary})`,
              }}
            >
              {useWeddingCard && weddingCardImage ? (
                <>
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={weddingCardImage} alt="card" className="w-full block rounded-t" />
                  </div>

                  {/* Details panel below the image so it doesn't cover uploaded artwork */}
                  <div
                    className={`p-4 sm:p-6 text-center ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                  >
                    <h2 className="text-lg sm:text-2xl font-bold">{cardData.coupleName}</h2>
                    <p className="text-sm sm:text-base">{cardData.weddingDate}</p>
                    <p
                      className="mt-2 text-xs sm:text-sm inline-block px-3 py-1 rounded"
                      style={{
                        background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                      }}
                    >
                      {cardData.message}
                    </p>
                    {cardData.qrCodeUrl && showQRCode && (
                      <div className="mt-3 flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cardData.qrCodeUrl}
                          alt="qr"
                          className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1 rounded"
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-white">
                  <h2 className="text-2xl font-bold">{cardData.coupleName}</h2>
                  <p className="mt-1">{cardData.weddingDate}</p>
                  <p className="mt-3 text-sm bg-white/20 rounded p-2">{cardData.message}</p>
                  {cardData.qrCodeUrl && showQRCode && (
                    <div className="mt-4 flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cardData.qrCodeUrl}
                        alt="qr"
                        className="w-24 h-24 bg-white p-1 rounded"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={downloadAndShareToWhatsApp}
                className="px-3 py-2 rounded bg-green-600 text-white"
              >
                Download & Share to WhatsApp
              </button>
              <button onClick={downloadCard} className="px-3 py-2 rounded bg-blue-600 text-white">
                Download Only
              </button>
            </div>

            <div
              className={`mt-3 p-3 rounded border ${isDarkMode ? "bg-blue-900/10 border-blue-800 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-700"}`}
            >
              <p className="text-xs">
                Tip: On desktop, download the card then attach it to WhatsApp. On mobile the native
                share may attach the image automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
