import { cleanup, fireEvent, render } from '@testing-library/react';
import { evaluateReading, type Site } from '@workspace/psychrometrics-data';
import { psychrometricsFixtures } from '@workspace/psychrometrics-data/mocks';
import { afterEach, describe, expect, it } from 'vitest';
import { PsychrometricChart } from './psychrometric-chart.js';

const hallA = psychrometricsFixtures.sites[0];
if (!hallA) throw new Error('Fixture is missing Hall A');
const site: Site = {
  id: hallA.id,
  name: hallA.name,
  envelope: hallA.envelope,
  allowableEnvelope: hallA.allowableEnvelope
};
const trail = hallA.readings.slice(0, 7);
const current = trail.at(-1);
if (!current) throw new Error('Fixture has no readings');

const renderChart = (props: { stale?: boolean } = {}) =>
  render(
    <PsychrometricChart
      envelope={site.envelope}
      allowableEnvelope={site.allowableEnvelope}
      trail={trail}
      level={evaluateReading(current, site).level}
      {...props}
    />
  );

afterEach(cleanup);

describe('PsychrometricChart', () => {
  it('draws the axes, isolines, both zones and the trail', () => {
    const { container } = renderChart();
    const layer = (name: string) => container.querySelector(`[data-layer="${name}"]`);

    for (const name of [
      'axes',
      'saturation-curve',
      'saturation-shade',
      'relative-humidity',
      'wet-bulb',
      'recommended-zone',
      'allowable-zone',
      'trail'
    ]) {
      expect(layer(name), name).not.toBeNull();
    }
    expect(container.querySelectorAll('[data-isoline^="relative-humidity-"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-isoline^="wet-bulb-"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-marker]')).toHaveLength(7);
    expect(container.querySelectorAll('[data-marker="current"]')).toHaveLength(1);
  });

  it('labels the dew-point axis from -10 to 20 °C', () => {
    const { container, getByText } = renderChart();

    expect(getByText('Dew point (°C)')).not.toBeNull();
    const ticks = [...container.querySelectorAll('[data-axis="dew-point"]')].map(
      el => el.textContent
    );
    expect(ticks).toEqual(['-10', '-5', '0', '5', '10', '15', '20']);
  });

  it('omits the allowable zone when the site has none', () => {
    const { container } = render(<PsychrometricChart envelope={site.envelope} trail={trail} />);

    expect(container.querySelector('[data-layer="allowable-zone"]')).toBeNull();
  });

  it('dims the trail when stale', () => {
    const { container } = renderChart({ stale: true });

    expect(container.querySelector('[data-layer="trail"]')?.getAttribute('data-stale')).toBe(
      'true'
    );
  });

  it('shows a tooltip on hover and clears it on leave', () => {
    const { container, queryByRole } = renderChart();
    const overlay = container.querySelector('[data-layer="hover-overlay"]');
    if (!overlay) throw new Error('No hover overlay');
    // jsdom does no layout: give the SVG a size so screen pixels map onto the viewBox.
    const svg = container.querySelector('svg');
    if (!svg) throw new Error('No svg');
    svg.getBoundingClientRect = () => new DOMRect(0, 0, 860, 560);

    fireEvent.pointerMove(overlay, { clientX: 300, clientY: 300 });
    expect(queryByRole('tooltip')).not.toBeNull();
    expect(queryByRole('tooltip')?.textContent).toMatch(/Dry bulb/);

    fireEvent.pointerLeave(overlay);
    expect(queryByRole('tooltip')).toBeNull();
  });
});
