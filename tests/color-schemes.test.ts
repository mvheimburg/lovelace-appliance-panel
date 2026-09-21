import { makeHass } from "./ui-fixtures";
import { afterEach, expect, it } from "vitest";
import "../src/appliance-panel-card";
import "../src/editors";

type Element = HTMLElement & {
  setConfig(config: Record<string, unknown>): void;
  hass: {
    language?: string;
    locale?: { language?: string };
    states: Record<string, unknown>;
  };
  updateComplete: Promise<boolean>;
};
type Form = HTMLElement & {
  schema: Array<{
    name: string;
    selector: { select?: { options: Array<{ value: string; label: string }> } };
  }>;
  data: Record<string, unknown>;
  computeLabel(field: { name: string }): string;
};
const config = { type: "custom:kitchen-panel-card" };
afterEach(() => document.body.replaceChildren());

it.each(["default", "bubble"])(
  "applies every light palette over a dark dashboard in %s appearance and restores inheritance",
  async (appearance) => {
    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "--primary-text-color: rgb(240, 240, 240); --card-background-color: rgb(20, 20, 20); --bubble-main-background-color: rgb(10, 10, 10)";
    document.body.append(wrapper);
    const card = document.createElement(
      "kitchen-panel-card",
    ) as unknown as Element;
    card.setConfig({ ...config, appearance });
    card.hass = makeHass().hass;
    wrapper.append(card);
    await card.updateComplete;
    expect(getComputedStyle(card).color).toBe("rgb(240, 240, 240)");
    const surfaces = new Set<string>();
    for (const color_scheme of ["bright", "warm", "mint", "sky", "lavender"]) {
      card.setConfig({ ...config, appearance, color_scheme });
      await card.updateComplete;
      const style = getComputedStyle(card);
      expect(style.color).toBe("rgb(32, 43, 54)");
      expect(style.colorScheme).toBe("light");
      expect(
        style.getPropertyValue("--bubble-main-background-color").trim(),
      ).toBe(style.getPropertyValue("--card-background-color").trim());
      surfaces.add(style.getPropertyValue("--card-background-color").trim());
      const surface = card.shadowRoot!.querySelector("ha-card");
      expect(surface).not.toBeNull();
      const background = getComputedStyle(surface!).backgroundColor;
      expect(background).not.toBe("rgba(0, 0, 0, 0)");
      expect(contrast(style.color, background)).toBeGreaterThanOrEqual(4.5);
      const muted = style.getPropertyValue("--secondary-text-color").trim();
      expect(contrast(muted, background)).toBeGreaterThanOrEqual(4.5);
      expect(
        getComputedStyle(wrapper)
          .getPropertyValue("--card-background-color")
          .trim(),
      ).toBe("rgb(20, 20, 20)");
    }
    expect(surfaces.size).toBe(5);
    card.setConfig({ ...config, appearance, color_scheme: "home-assistant" });
    await card.updateComplete;
    expect(getComputedStyle(card).color).toBe("rgb(240, 240, 240)");
    card.setConfig({ ...config, appearance, color_scheme: "mint" });
    card.setConfig({ ...config, appearance });
    await card.updateComplete;
    expect(getComputedStyle(card).color).toBe("rgb(240, 240, 240)");
  },
);

it("rejects an unknown scheme without replacing the selected palette", async () => {
  const card = document.createElement(
    "kitchen-panel-card",
  ) as unknown as Element;
  card.setConfig({ ...config, color_scheme: "mint" });
  document.body.append(card);
  await card.updateComplete;
  expect(() => card.setConfig({ ...config, color_scheme: "invalid" })).toThrow(
    /color_scheme/,
  );
  expect(getComputedStyle(card).color).toBe("rgb(32, 43, 54)");
});

it.each(["nb", "NB_no", "no", "nn-NO"])(
  "offers translated schemes for %s, emits stable values, preserves configuration and follows language changes",
  async (language) => {
    const editor = document.createElement(
      "kitchen-panel-card-editor",
    ) as unknown as Element;
    editor.hass = { ...makeHass().hass, language };
    editor.setConfig({
      ...config,
      name: "My room",
      title: "My room",
      appearance: "bubble",
    });
    document.body.append(editor);
    await editor.updateComplete;
    const root = editor.shadowRoot!;
    const select = root.querySelector<HTMLSelectElement>(
      'select[name="color_scheme"]',
    );
    const form = root.querySelector<Form>("ha-form");
    const labels = () =>
      select
        ? root.textContent
        : form?.schema
            .find((field) => field.name === "color_scheme")
            ?.selector.select?.options.map((option) => option.label)
            .join(" ");
    expect(labels()).toContain("Lys");
    if (select) expect(root.textContent).toContain("Fargevalg");
    else expect(form!.computeLabel({ name: "color_scheme" })).toBe("Fargevalg");
    let emitted: Record<string, unknown> | undefined;
    editor.addEventListener("config-changed", (event) => {
      emitted = (event as CustomEvent).detail.config;
    });
    if (select) {
      select.value = "lavender";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      form!.dispatchEvent(
        new CustomEvent("value-changed", {
          detail: { value: { ...form!.data, color_scheme: "lavender" } },
        }),
      );
    }
    expect(emitted).toMatchObject({
      color_scheme: "lavender",
      appearance: "bubble",
      name: "My room",
      title: "My room",
    });
    editor.hass = { ...makeHass().hass, language: "en-GB" };
    await editor.updateComplete;
    expect(labels()).toContain("Bright");
    editor.hass = {
      ...makeHass().hass,
      language: undefined,
      locale: { language: "nb-NO" },
    };
    await editor.updateComplete;
    expect(labels()).toContain("Lys");
    editor.hass = { ...makeHass().hass, language: "fr" };
    await editor.updateComplete;
    expect(labels()).toContain("Bright");
  },
);

// WCAG relative luminance: verify readable text on each rendered surface.
function contrast(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const channels = color.startsWith("#")
      ? color
          .slice(1)
          .match(/../g)!
          .map((part) => parseInt(part, 16))
      : color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number);
    const linear = channels.map((channel) => {
      const s = channel / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const a = luminance(foreground),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
