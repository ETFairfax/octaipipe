// The chart's fixed frame. Geometry works in data coordinates: `t` is dry-bulb temperature in °C
// and `w` is humidity ratio in g water per kg dry air (the physics works in kg/kg, so every
// crossing from physics into geometry goes through `toGPerKg`).

export type ChartPoint = { t: number; w: number };

export type ChartDomain = { tMin: number; tMax: number; wMin: number; wMax: number };

export const chartDomain: ChartDomain = { tMin: 10, tMax: 40, wMin: 0, wMax: 25 };

export const relativeHumidityIsolines = [20, 40, 60, 80] as const; // %
export const wetBulbIsolines = [5, 10, 15, 20, 25] as const; // °C
export const dewPointTicks = [-10, -5, 0, 5, 10, 15, 20] as const; // °C
export const dryBulbTicks = [10, 15, 20, 25, 30, 35, 40] as const; // °C
export const humidityRatioTicks = [0, 5, 10, 15, 20, 25] as const; // g/kg

export const toGPerKg = (w: number): number => w * 1000;
export const fromGPerKg = (w: number): number => w / 1000;
