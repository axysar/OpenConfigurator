import { useMemo, useState } from 'react';
import { useTheme } from '@core/index';
import { DEFAULT_TEMPLATE_ID, TEMPLATE_REGISTRY, getTemplateById } from './templates/registry';

export default function App(): JSX.Element {
  const [activeTemplateId, setActiveTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const { theme, toggleTheme } = useTheme();

  const activeTemplate = useMemo(
    () => getTemplateById(activeTemplateId),
    [activeTemplateId],
  );

  const ActiveTemplateComponent = activeTemplate.Component;

  return (
    <div className="oc-root">
      <header className="oc-topbar" aria-label="OpenConfigurator chrome">
        <div className="oc-brand">
          <p className="oc-eyebrow">OpenConfigurator</p>
          <h1>General 3D Configurator Platform</h1>
          <p>{activeTemplate.description}</p>
        </div>

        <div className="oc-topbar-actions">
          <div className="oc-template-switcher">
            <label htmlFor="template-select">Template</label>
            <select
              id="template-select"
              value={activeTemplateId}
              onChange={(event) => setActiveTemplateId(event.target.value)}
            >
              {TEMPLATE_REGISTRY.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.tagline})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="oc-icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
      </header>

      <main className="oc-template-host">
        <ActiveTemplateComponent />
      </main>
    </div>
  );
}
