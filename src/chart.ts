import { svg, nothing } from "lit";
import { isTemperature, ticks, type Point, type Series } from "./history";

const LEFT = 44,
  TOP = 24,
  BOTTOM = 196,
  H = 230,
  /** Room right of the plot for the second scale. */
  GUTTER = 44;

export interface ChartText {
  number: (value: number, digits: number) => string;
  time: (ms: number, withDay: boolean) => string;
  label: string;
}

/**
 * Unbroken spells of a series. With `hold`, a value lasts until the next
 * change, so the spell runs on to the moment it became unavailable.
 */
function runs(points: Point[], hold: boolean): Array<Array<[number, number]>> {
  const out: Array<Array<[number, number]>> = [];
  let current: Array<[number, number]> = [];
  for (const [t, v] of points) {
    if (v === undefined) {
      if (current.length) {
        if (hold) current.push([t, current[current.length - 1][1]]);
        out.push(current);
      }
      current = [];
    } else current.push([t, v]);
  }
  if (current.length) out.push(current);
  return out;
}

function scale(series: Series[], pad: number) {
  const values = series.flatMap((s) =>
    s.points.flatMap(([, v]) => (v === undefined ? [] : [v])),
  );
  if (!values.length) return undefined;
  const lo = Math.min(...values),
    hi = Math.max(...values);
  const marks = ticks(lo - pad, hi + pad);
  return { marks, min: marks[0], max: marks[marks.length - 1] };
}

/** The left unit: temperatures when there are any, else the first reading's. */
export function units(series: Series[]): [string, string | undefined] {
  const left =
    series.find((s) => isTemperature(s.unit))?.unit ?? series[0]?.unit ?? "";
  return [left, series.find((s) => s.unit !== left)?.unit];
}

/**
 * One chart of an appliance's readings: the left scale in the main unit
 * (temperatures), a right-hand scale for a reading in another unit.
 * Unavailable spells are gaps; setpoints are dashed.
 */
export function chart(
  series: Series[],
  start: number,
  end: number,
  hover: number | undefined,
  text: ChartText,
  W = 600,
) {
  const [leftUnit, rightUnit] = units(series);
  const RIGHT = W - (rightUnit === undefined ? 12 : GUTTER);
  const left = series.filter((s) => s.unit === leftUnit);
  const right =
    rightUnit === undefined ? [] : series.filter((s) => s.unit === rightUnit);
  const pad = (list: Series[], unit: string) =>
    isTemperature(unit)
      ? 1
      : list.some((s) =>
            s.points.some(([, v]) => v !== undefined && Math.abs(v) >= 10),
          )
        ? 1
        : 0.1;
  const l = scale(left, pad(left, leftUnit)),
    r = scale(right, pad(right, rightUnit ?? ""));
  const x = (t: number) =>
    LEFT +
    ((Math.min(Math.max(t, start), end) - start) / (end - start)) *
      (RIGHT - LEFT);
  const y = (v: number, s: { min: number; max: number }) =>
    BOTTOM - ((v - s.min) / (s.max - s.min || 1)) * (BOTTOM - TOP);
  const hours = (end - start) / 3_600_000;
  const narrow = W < 480;
  const every =
    hours <= 6
      ? narrow
        ? 2
        : 1
      : hours <= 24
        ? narrow
          ? 6
          : 4
        : narrow
          ? 48
          : 24;
  const xTicks: number[] = [];
  const hour = new Date(start);
  hour.setMinutes(0, 0, 0);
  let midnights = 0;
  for (let t = hour.getTime(); t <= end; t += 3_600_000) {
    const h = new Date(t).getHours();
    if (t < start) continue;
    if (
      every >= 24
        ? h === 0 && midnights++ % (every / 24) === 0
        : h % every === 0
    )
      xTicks.push(t);
  }
  const path = (s: Series, sc: { min: number; max: number }) =>
    runs(s.points, s.setpoint)
      .map((run) =>
        // A setpoint holds each value until it is changed: steps.
        run
          .map(([t, v], i) =>
            i
              ? s.setpoint
                ? `H${x(t).toFixed(1)} V${y(v, sc).toFixed(1)}`
                : `L${x(t).toFixed(1)},${y(v, sc).toFixed(1)}`
              : `M${x(t).toFixed(1)},${y(v, sc).toFixed(1)}`,
          )
          .join(" "),
      )
      .join(" ");
  // As many decimals as the tick steps need (2.5 steps show 57.5, not 58).
  const digits = (sc: { marks: number[] }) =>
    Math.min(
      2,
      Math.max(...sc.marks.map((v) => String(v).split(".")[1]?.length ?? 0)),
    );
  const line = (s: Series, sc: { min: number; max: number }) =>
    svg`<path class=${`line series-${s.color}${s.setpoint ? " dashed" : ""}`} data-entity=${s.entityId} d=${path(s, sc)}></path>`;
  const grid = l ?? r;
  return svg`<svg class="history-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label=${text.label}>
    <title>${text.label}</title>
    ${grid?.marks.map(
      (v) =>
        svg`<line class="grid" x1=${LEFT} x2=${RIGHT} y1=${y(v, grid)} y2=${y(v, grid)}></line>`,
    )}
    ${
      l
        ? l.marks.map(
            (v) =>
              svg`<text class="axis" x=${LEFT - 6} y=${y(v, l) + 4} text-anchor="end">${text.number(v, digits(l))}</text>`,
          )
        : nothing
    }
    ${
      l && leftUnit
        ? svg`<text class="axis unit" x="4" y="12">${leftUnit}</text>`
        : nothing
    }
    ${
      r
        ? r.marks.map(
            (v) =>
              svg`<text class="axis" x=${RIGHT + 6} y=${y(v, r) + 4}>${text.number(v, digits(r))}</text>`,
          )
        : nothing
    }
    ${
      r && rightUnit
        ? svg`<text class="axis unit" x=${W - 4} y="12" text-anchor="end">${rightUnit}</text>`
        : nothing
    }
    ${xTicks.map(
      (t) =>
        svg`<line class="grid" x1=${x(t)} x2=${x(t)} y1=${TOP} y2=${BOTTOM}></line>
        <text class="axis" x=${x(t)} y=${BOTTOM + 18} text-anchor="middle">${text.time(t, every >= 24)}</text>`,
    )}
    ${l ? left.map((s) => line(s, l)) : nothing}
    ${r ? right.map((s) => line(s, r)) : nothing}
    ${
      hover === undefined
        ? nothing
        : svg`<line class="cursor" x1=${x(hover)} x2=${x(hover)} y1=${TOP} y2=${BOTTOM}></line>`
    }
  </svg>`;
}

/** The time under a pointer over the chart. */
export function timeAt(
  event: PointerEvent,
  element: SVGSVGElement,
  start: number,
  end: number,
  twoScales: boolean,
): number {
  const box = element.getBoundingClientRect();
  const W = element.viewBox?.baseVal?.width || box.width;
  const px = ((event.clientX - box.left) / box.width) * W;
  const ratio = (px - LEFT) / (W - (twoScales ? GUTTER : 12) - LEFT);
  return start + Math.min(1, Math.max(0, ratio)) * (end - start);
}
