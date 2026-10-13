import {
  type Envelope,
  evaluateReading,
  humidityRatio,
  type Site
} from '@workspace/psychrometrics-data';
import { psychrometricsFixtures } from '@workspace/psychrometrics-data/mocks';
import { describe, expect, it } from 'vitest';
import { type ChartPoint, toGPerKg } from './chart-domain.js';
import { buildZone } from './zone.js';

const inRing = (ring: ChartPoint[], p: ChartPoint): boolean => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (!a || !b) continue;
    if (a.w > p.w !== b.w > p.w && p.t < ((b.t - a.t) * (p.w - a.w)) / (b.w - a.w) + a.t) {
      inside = !inside;
    }
  }
  return inside;
};

const inZone = (zone: ChartPoint[][], p: ChartPoint) => zone.some(ring => inRing(ring, p));

const bounds = (zone: ChartPoint[][]) => {
  const points = zone.flat();
  return {
    tMin: Math.min(...points.map(p => p.t)),
    tMax: Math.max(...points.map(p => p.t)),
    wMin: Math.min(...points.map(p => p.w)),
    wMax: Math.max(...points.map(p => p.w))
  };
};

describe('buildZone', () => {
  it('is bounded by dry-bulb limits on the sides and a dew-point limit below', () => {
    const zone = buildZone({ dryBulbMinC: 18, dryBulbMaxC: 27, dewPointMinC: -9 });

    const { tMin, tMax, wMin } = bounds(zone);
    expect(tMin).toBeCloseTo(18);
    expect(tMax).toBeCloseTo(27);
    // W at a -9 °C dew point.
    expect(wMin).toBeCloseTo(toGPerKg(humidityRatio(-9, 1)), 3);
  });

  it('is capped by the saturation curve when there is no upper humidity bound', () => {
    const zone = buildZone({ dryBulbMinC: 18, dryBulbMaxC: 20 });

    expect(inZone(zone, { t: 19, w: toGPerKg(humidityRatio(19, 0.99)) })).toBe(true);
    expect(inZone(zone, { t: 19, w: toGPerKg(humidityRatio(19, 1.02)) })).toBe(false);
  });

  it('floors at zero when there is no lower humidity bound', () => {
    const zone = buildZone({ dryBulbMinC: 18, dryBulbMaxC: 20 });

    expect(bounds(zone).wMin).toBe(0);
  });

  it('puts a sharp corner where two upper bounds cross', () => {
    // RH 60 % is the lower ceiling at low T, the wet-bulb cap at high T: a corner where they meet.
    const zone = buildZone({ dryBulbMinC: 15, dryBulbMaxC: 30, rhMaxPct: 60, wetBulbMaxC: 18.5 });
    const ring = zone[0] ?? [];
    const rh60 = (t: number) => toGPerKg(humidityRatio(t, 0.6));
    // The corner is a vertex that sits on the RH curve while its neighbours leave it.
    const onCurve = ring.filter(p => Math.abs(p.w - rh60(p.t)) < 1e-6);
    const last = onCurve.at(-1);
    expect(last).toBeDefined();
    expect(last?.t).toBeGreaterThan(15);
    expect(last?.t).toBeLessThan(30);
  });

  it('is empty when the bounds contradict each other', () => {
    expect(buildZone({ dryBulbMinC: 30, dryBulbMaxC: 20 })).toEqual([]);
    expect(buildZone({ rhMinPct: 90, rhMaxPct: 10 })).toEqual([]);
  });

  it('with no bounds at all is the whole plot below saturation', () => {
    const zone = buildZone({});

    expect(inZone(zone, { t: 15, w: 1 })).toBe(true);
  });
});

// The zone is derived from the same bounds the compliance check reads; they must never disagree.
describe.each(psychrometricsFixtures.sites)('zone agrees with compliance: $name', siteRecord => {
  const site: Site = {
    id: siteRecord.id,
    name: siteRecord.name,
    envelope: siteRecord.envelope,
    allowableEnvelope: siteRecord.allowableEnvelope
  };
  const recommended = buildZone(site.envelope);
  const allowable = buildZone(site.allowableEnvelope as Envelope);

  const grid: { t: number; rhPct: number }[] = [];
  for (let t = 10.13; t < 40; t += 0.77) {
    for (let rhPct = 2.3; rhPct < 100; rhPct += 3.1) grid.push({ t, rhPct });
  }

  it('has points on both sides of each zone, so the agreement is not vacuous', () => {
    const inside = (zone: ChartPoint[][]) =>
      grid.filter(({ t, rhPct }) =>
        inZone(zone, { t, w: toGPerKg(humidityRatio(t, rhPct / 100)) })
      );

    expect(inside(recommended).length).toBeGreaterThan(10);
    expect(inside(recommended).length).toBeLessThan(grid.length);
    expect(inside(allowable).length).toBeGreaterThan(inside(recommended).length);
  });

  it('inside the recommended zone iff the check says Recommended', () => {
    const disagreements = grid.filter(({ t, rhPct }) => {
      const point = { t, w: toGPerKg(humidityRatio(t, rhPct / 100)) };
      const level = evaluateReading(
        { timestamp: '2026-08-24T08:00:00Z', dryBulbC: t, rhPct },
        site
      ).level;
      return inZone(recommended, point) !== (level === 'recommended');
    });

    expect(disagreements).toEqual([]);
  });

  it('inside the allowable zone iff the check does not say Out', () => {
    const disagreements = grid.filter(({ t, rhPct }) => {
      const point = { t, w: toGPerKg(humidityRatio(t, rhPct / 100)) };
      const level = evaluateReading(
        { timestamp: '2026-08-24T08:00:00Z', dryBulbC: t, rhPct },
        site
      ).level;
      return inZone(allowable, point) !== (level !== 'out');
    });

    expect(disagreements).toEqual([]);
  });
});
