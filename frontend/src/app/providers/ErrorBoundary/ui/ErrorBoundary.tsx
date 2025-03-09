import { Spin } from 'antd';
import cn from 'classnames';
import type { TFunction } from 'i18next';
import React, { ErrorInfo, ReactNode, Suspense } from 'react';
import { withTranslation } from 'react-i18next';

import { PageError } from '../../../../widgets/PageError';
import styles from './error-boundary.module.scss';

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
        <Suspense fallback={<Spin style={{ width: '100%', height: '100vh', marginTop: '400px' }} />}>
          <PageError error={error} />
        </Suspense>
      );
    }

    return children;
  }
}

export default withTranslation()(ErrorBoundary);
