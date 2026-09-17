import { ApplianceCard } from "./card";
import "./editors";
const cards = [
  ["oven-card", "Oven", "Oven with optional microwave and steam modules"],
  ["dishwasher-card", "Dishwasher", "Programme, wash options and care"],
  [
    "coffee-machine-card",
    "Coffee machine",
    "Drinks, preferences and consumables",
  ],
  [
    "refrigerator-card",
    "Refrigerator",
    "Temperature zones, doors and cooling modes",
  ],
  ["appliance-card", "Appliance", "Other Home Connect Local appliances"],
  [
    "kitchen-panel-card",
    "Kitchen panel",
    "Running appliances and attention across your kitchen",
  ],
];
for (const [type, name, description] of cards) {
  class Card extends ApplianceCard {
    static getConfigElement() {
      return document.createElement(`${type}-editor`);
    }
    static getStubConfig() {
      return {
        type: `custom:${type}`,
        ...(type === "kitchen-panel-card" ? {} : { device: "" }),
      };
    }
  }
  customElements.define(type, Card);
  const host = window as unknown as {
    customCards: Array<Record<string, unknown>>;
  };
  host.customCards ??= [];
  host.customCards.push({ type, name, description, preview: true });
}
