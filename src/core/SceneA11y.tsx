/**
 * Provides a screen-reader-accessible description of the 3D scene.
 *
 * Since <canvas> is opaque to assistive technology, this component
 * renders a visually-hidden live region that describes the current
 * configuration. It updates whenever the description changes, so
 * screen readers announce the new state.
 */

interface SceneA11yProps {
  description: string;
}

export const SceneA11y = ({ description }: SceneA11yProps): JSX.Element => (
  <div
    className="sr-only"
    role="img"
    aria-label={description}
    aria-live="polite"
    aria-atomic="true"
  >
    {description}
  </div>
);
