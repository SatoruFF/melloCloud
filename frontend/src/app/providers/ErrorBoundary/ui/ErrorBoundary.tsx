import type { TFunction } from 'i18next';
import React, { type ErrorInfo, type ReactNode, Suspense } from 'react';
import { withTranslation } from 'react-i18next';

import { Spinner } from '../../../../shared';
import { PageError } from '../../../../widgets/PageError';

interface ErrorBoundaryProps {
  children: ReactNode;
  t: TFunction;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState & { error?: Error }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Suspense fallback={<Spinner fullscreen />}>
          <PageError error={error} />
        </Suspense>
      );
    }

    return children;
  }
}

export default withTranslation()(ErrorBoundary);
