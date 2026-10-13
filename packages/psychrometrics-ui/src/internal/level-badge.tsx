import type { ComplianceLevel } from '@workspace/psychrometrics-data';
import { Badge } from '@workspace/ui/components';
import { levelLabels } from './format.js';

const levelClasses: Record<ComplianceLevel, string> = {
  recommended: 'bg-success/15 text-success',
  allowable: 'bg-warning/20 text-warning',
  out: 'bg-destructive/15 text-destructive'
};

export function LevelBadge({
  level,
  lastKnown = false
}: {
  level: ComplianceLevel;
  /** The level belongs to a reading that may no longer be current. */
  lastKnown?: boolean;
}) {
  return (
    <Badge
      data-level={level}
      variant={lastKnown ? 'outline' : 'default'}
      className={lastKnown ? 'text-muted-foreground' : levelClasses[level]}
    >
      {lastKnown ? `Last known: ${levelLabels[level]}` : levelLabels[level]}
    </Badge>
  );
}
