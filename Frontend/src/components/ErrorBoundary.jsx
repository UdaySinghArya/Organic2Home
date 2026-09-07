import { Component } from 'react';
import Button from './ui/Button.jsx';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="ks-page flex min-h-dvh items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="ks-headline">Something went wrong</h1>
          <p className="mt-2 text-[15px] text-on-surface-variant">
            Refresh the page and try again. Your harvest session is still on this device.
          </p>
          <Button className="mt-6 w-full" onClick={() => window.location.assign('/')}>
            Go home
          </Button>
        </div>
      </main>
    );
  }
}
