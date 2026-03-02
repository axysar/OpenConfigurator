import { useMemo, useState } from 'react';
import { DEFAULT_TEMPLATE_ID, TEMPLATE_REGISTRY, getTemplateById } from './templates/registry';

export default function App(): JSX.Element {
  const [activeTemplateId, setActiveTemplateId] = useState(DEFAULT_TEMPLATE_ID);

  const activeTemplate = useMemo(
    () => getTemplateById(activeTemplateId),
    [activeTemplateId],
  );

  const ActiveTemplateComponent = activeTemplate.Component;

  return (
    <div className="oc-root">
      <header className="oc-topbar">
        <div className="oc-brand">
          <p className="oc-eyebrow">OpenConfigurator</p>
          <h1>General 3D Configurator Platform</h1>
          <p>{activeTemplate.description}</p>
        </div>

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
      </header>

      <main className="oc-template-host">
        <ActiveTemplateComponent />
      </main>
    </div>
  );
}
