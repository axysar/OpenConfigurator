export const LoadingScreen = (): JSX.Element => (
  <div className="oc-loading" role="status" aria-label="Loading configurator">
    <div style={{ textAlign: 'center' }}>
      <div className="oc-spinner" />
      <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Loading configurator...
      </p>
    </div>
  </div>
);
