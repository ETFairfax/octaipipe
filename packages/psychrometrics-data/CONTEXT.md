# Psychrometrics Data

The data half of the Psychrometrics domain: the site feed, the humid-air physics and the compliance
rules. Sits below `@workspace/psychrometrics-ui` (the UI half). See `docs/frontend-architecture.md`.

## Language

**Site**:
A monitored data-centre hall. Has an id, a name, one **Envelope** and an optional **Allowable
Envelope**. Its **Readings** arrive one per poll through the **Feed**, never in bulk. A second
site is a data change (append it to `conditions.json`), not a code change.

**Reading**:
One timestamped measurement of a hall: dry-bulb temperature and relative humidity. Every other
quantity (dew point, wet bulb, humidity ratio) is derived from these two.
_Avoid_: Sample, measurement, point (a Reading is plotted as a point; it is not one).

**Envelope**:
The contractual operating limits of a site: a set of **Bounds**. The recommended envelope is the
inner limit.

**Allowable Envelope**:
An optional outer set of Bounds around the Envelope. Readings between the two are tolerated but
not recommended.

**Bound**:
One lower or upper limit on one quantity (dry bulb, dew point, relative humidity, wet bulb). A
missing bound means no limit in that direction. Bounds are inclusive.

**Compliance Level**:
Where a Reading sits against a site's envelopes: **Recommended** (inside the Envelope),
**Allowable** (outside it but inside the Allowable Envelope) or **Out** (outside both).
_Avoid_: Status, health.

**Violation**:
A Bound a Reading breaks, naming the quantity, the limit and the reading's value.

**Near-Bound Warning**:
A compliant Reading that lies within a small margin of a Bound. The margin is per quantity.

**Feed**:
The polled source of a Site and its Readings. One Reading is consumed per poll; a failed poll
consumes nothing.

**Feed State**:
Whether the displayed Reading can be trusted as current:
- **Live**: the last poll succeeded recently.
- **Stale**: the last poll failed, or no new Reading has arrived within the freshness window. The
  last Reading stays visible but is marked old.
- **Ended**: the Feed has no more Readings. It stops rather than wrapping, so history is never
  shown as live.

**Trail**:
The current Reading plus the previous six, in order.
