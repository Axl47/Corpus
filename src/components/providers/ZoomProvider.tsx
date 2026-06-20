"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ZOOM_KEY = "corpus_desktop_zoom";

function readZoom(): number {
  try {
    const v = parseFloat(localStorage.getItem(ZOOM_KEY) || "");
    if (!isNaN(v) && v >= 0.5 && v <= 2.0) return v;
  } catch {}
  return 1;
}

const ZoomContext = createContext<number>(1);

/**
 * Returns the current desktop zoom factor (1 when no zoom or in web view).
 * Use this to adjust `getBoundingClientRect()` coordinates before applying
 * them to `position: fixed` elements — when a CSS transform is the fixed
 * containing block, viewport coords must be divided by the zoom factor.
 */
export function useZoom(): number {
  return useContext(ZoomContext);
}

export default function ZoomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(readZoom());
    // Clear any CSS zoom applied by Tauri initialization_script before React mounted
    document.documentElement.style.zoom = "";
    document.documentElement.style.width = "";
    document.documentElement.style.height = "";
    document.documentElement.style.overflow = "";

    const handler = () => setZoom(readZoom());
    window.addEventListener("corpus-zoom-changed", handler);
    return () => window.removeEventListener("corpus-zoom-changed", handler);
  }, []);

  if (zoom === 1) {
    return (
      <ZoomContext.Provider value={1}>
        <div className="h-screen overflow-hidden">{children}</div>
      </ZoomContext.Provider>
    );
  }

  const inv = `${(100 / zoom).toFixed(4)}%`;
  return (
    <ZoomContext.Provider value={zoom}>
      <div className="h-screen w-screen overflow-hidden">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: inv,
            height: inv,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </ZoomContext.Provider>
  );
}
