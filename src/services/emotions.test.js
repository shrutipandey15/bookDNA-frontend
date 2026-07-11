import { describe, it, expect } from "vitest";
import { EMOTIONS, EMO_LIST, hydrateEmotions, getPrimaryEmotion } from "./emotions";

describe("shared emotion vocabulary [F1.5 / P2-9]", () => {
  it("seed labels already match the canonical backend names (no drift)", () => {
    // These are the exact slugs that diverged before B2.10.
    expect(EMOTIONS.grief.label).toBe("Grief");
    expect(EMOTIONS.tenderness.label).toBe("Tenderness");
    expect(EMOTIONS.longing.label).toBe("Longing");
    expect(EMOTIONS.devastation.label).toBe("Devastation");
  });

  it("keeps presentation (Icon/glyph) local while carrying server label/color", () => {
    expect(EMOTIONS.grief.Icon).toBeTypeOf("object"); // lucide component (forwardRef obj)
    expect(EMOTIONS.grief.glyph).toBeTypeOf("string");
  });

  it("hydrateEmotions overwrites label/color/desc from the served vocab in place", () => {
    const ref = EMOTIONS.grief; // same object reference must survive hydration
    hydrateEmotions({
      version: 2,
      emotions: [
        { slug: "grief", name: "Grief (v2)", symbol: "💧", color: "#000000", description: "updated" },
      ],
    });
    expect(EMOTIONS.grief).toBe(ref); // mutated in place, not replaced
    expect(EMOTIONS.grief.label).toBe("Grief (v2)");
    expect(EMOTIONS.grief.color).toBe("#000000");
    expect(EMOTIONS.grief.symbol).toBe("💧");
    // Presentation preserved through hydration.
    expect(EMOTIONS.grief.glyph).toBeTypeOf("string");
    // EMO_LIST still references the same live object.
    expect(EMO_LIST.find(([s]) => s === "grief")[1].label).toBe("Grief (v2)");
  });

  it("getPrimaryEmotion falls back for unknown slugs", () => {
    expect(getPrimaryEmotion({ emotions: [{ emotion_id: "nope" }] }).label).toBe("Unknown");
    expect(getPrimaryEmotion({ emotions: [{ emotion_id: "rage" }] }).label).toBe("Rage");
  });
});
