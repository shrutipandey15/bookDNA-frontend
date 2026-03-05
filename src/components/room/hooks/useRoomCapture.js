import { useState, useCallback } from "react";

export function useRoomCapture(roomRef, username) {
  const [capturing, setCapturing] = useState(false);

  const capture = useCallback(async () => {
    const node = roomRef.current;
    if (!node || capturing) return;
    setCapturing(true);

    try {
      const { default: html2canvas } = await import("html2canvas");

      const clone = node.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = node.offsetWidth + "px";
      document.body.appendChild(clone);

      const sanitizeColor = (val) => {
        if (!val || typeof val !== "string") return val;
        val = val.replace(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\)/g,
          (_, r, g, b, a) => {
            const ri = Math.round(parseFloat(r) * 255);
            const gi = Math.round(parseFloat(g) * 255);
            const bi = Math.round(parseFloat(b) * 255);
            const ai = a !== undefined ? parseFloat(a) : 1;
            return `rgba(${ri}, ${gi}, ${bi}, ${ai})`;
          }
        );
        val = val.replace(/color-mix\([^)]+\)/g, "rgba(100,100,100,0.5)");
        return val;
      };

      const resolveStyles = (src, dst) => {
        const computed = window.getComputedStyle(src);
        dst.style.cssText = "";
        for (const prop of computed) {
          let val = computed.getPropertyValue(prop);
          val = sanitizeColor(val);
          if (val.includes("repeating-conic-gradient")) {
            val = val.replace(/repeating-conic-gradient\([^)]+\)\s*[^,]+,?/g, "");
            if (!val.trim()) val = "#0c0b10";
          }
          try { dst.style.setProperty(prop, val); } catch {}
        }
        for (let i = 0; i < src.children.length; i++) {
          if (dst.children[i]) resolveStyles(src.children[i], dst.children[i]);
        }
      };
      resolveStyles(node, clone);

      clone.style.animation = "none";
      clone.querySelectorAll("*").forEach((el) => el.style.animation = "none");
      clone.querySelectorAll(".reading-room__controls, .drag-ghost, .item-tray, .room-save-error").forEach(el => el.style.display = "none");

      const shelfCanvas = await html2canvas(clone, {
        backgroundColor: "#08080c",
        scale: 3,
        useCORS: true,
        logging: false,
      });
      document.body.removeChild(clone);

      // Composite with branded footer
      const FOOTER_H = 60;
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = shelfCanvas.width;
      finalCanvas.height = shelfCanvas.height + FOOTER_H * 3;
      const ctx = finalCanvas.getContext("2d");

      ctx.drawImage(shelfCanvas, 0, 0);

      ctx.fillStyle = "#06060a";
      ctx.fillRect(0, shelfCanvas.height, finalCanvas.width, FOOTER_H * 3);

      ctx.fillStyle = "rgba(196, 85, 58, 0.3)";
      ctx.fillRect(0, shelfCanvas.height, finalCanvas.width, 2);

      ctx.fillStyle = "rgba(232, 228, 220, 0.5)";
      ctx.font = "500 36px 'JetBrains Mono', 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `BOOK DNA  ·  @${username || "reader"}  ·  ${new Date().getFullYear()}`,
        finalCanvas.width / 2,
        shelfCanvas.height + FOOTER_H * 1.8
      );

      const link = document.createElement("a");
      link.download = `bookdna-room-${username || "reader"}.png`;
      link.href = finalCanvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Room capture failed:", err);
      alert("Couldn't capture your room. Try using your device's screenshot instead.");
    }
    setCapturing(false);
  }, [roomRef, capturing, username]);

  return { capturing, capture };
}