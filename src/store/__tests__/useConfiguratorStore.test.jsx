import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useConfiguratorStore, DEFAULT_PARAMS } from '../useConfiguratorStore';

function WidthProbe() {
  const width = useConfiguratorStore((state) => state.params.width);
  return <span data-testid="width">{width}</span>;
}

describe('useConfiguratorStore', () => {
  beforeEach(() => {
    useConfiguratorStore.setState((state) => ({
      ...state,
      params: { ...DEFAULT_PARAMS },
      exploded: 0,
      turntable: false,
      blueprintMode: false,
      presets: {},
    }));
  });

  it('updates params via setParams and notifies subscribers', () => {
    render(<WidthProbe />);
    expect(screen.getByTestId('width').textContent).toBe(String(DEFAULT_PARAMS.width));

    act(() => {
      useConfiguratorStore.getState().setParams({ width: 720 });
    });

    expect(screen.getByTestId('width').textContent).toBe('720');
  });

  it('reset restores defaults', () => {
    render(<WidthProbe />);
    act(() => {
      useConfiguratorStore.getState().setParams({ width: 850 });
    });
    expect(screen.getByTestId('width').textContent).toBe('850');

    act(() => {
      useConfiguratorStore.getState().reset();
    });

    expect(screen.getByTestId('width').textContent).toBe(String(DEFAULT_PARAMS.width));
  });
});
