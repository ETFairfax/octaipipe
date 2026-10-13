import { Button } from '@workspace/ui/components/button';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type WidgetBoundaryProps = {
  children: ReactNode;
  /** Short label for the widget, used in the fallback message. */
  name?: string;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type WidgetBoundaryState = { error: Error | null };

/**
 * Isolates a failing embedded widget so the surrounding page survives. The host page wraps
 * cross-domain widgets in this; a widget never wraps itself.
 */
class WidgetBoundary extends Component<WidgetBoundaryProps, WidgetBoundaryState> {
  state: WidgetBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): WidgetBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role='alert'
        className='flex items-center justify-between gap-2 rounded-md border p-3 text-sm'
      >
        <span className='text-muted-foreground'>
          {this.props.name ? `${this.props.name} couldn't load.` : "This section couldn't load."}
        </span>
        <Button variant='outline' size='sm' onClick={this.reset}>
          Retry
        </Button>
      </div>
    );
  }
}

export type { WidgetBoundaryProps };
export { WidgetBoundary };
