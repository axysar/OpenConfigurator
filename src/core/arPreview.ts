/**
 * AR / WebXR Preview Module
 *
 * Enables users to preview configured products in their real-world
 * environment via AR on supported mobile devices. Uses the WebXR
 * Device API (immersive-ar session) and falls back to model-viewer
 * element for iOS Safari (which doesn't support WebXR but supports
 * AR Quick Look via USDZ).
 *
 * Flow:
 * 1. User configures product normally in the web UI
 * 2. Clicks "View in AR" button
 * 3. System exports current configuration as GLB
 * 4. On Android: WebXR immersive-ar session places model
 * 5. On iOS: <model-viewer> triggers AR Quick Look with USDZ
 *
 * This module handles capability detection, session management,
 * and provides hooks for the UI layer.
 */

export interface ArCapabilities {
  webXrSupported: boolean;
  arQuickLookSupported: boolean;
  anyArSupported: boolean;
}

export const detectArCapabilities = async (): Promise<ArCapabilities> => {
  let webXrSupported = false;
  const arQuickLookSupported = isIOS();

  if (typeof navigator !== 'undefined' && 'xr' in navigator) {
    try {
      const xr = navigator.xr;
      if (xr) {
        webXrSupported = await xr.isSessionSupported('immersive-ar');
      }
    } catch {
      webXrSupported = false;
    }
  }

  return {
    webXrSupported,
    arQuickLookSupported,
    anyArSupported: webXrSupported || arQuickLookSupported,
  };
};

const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export interface ArSessionConfig {
  modelUrl: string;
  scale?: number;
  title?: string;
  link?: string;
}

/**
 * Launch AR preview via model-viewer's AR feature.
 * Creates a temporary <model-viewer> element with ar attribute.
 */
export const launchModelViewerAr = (config: ArSessionConfig): void => {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById('oc-ar-viewer');
  if (existing) existing.remove();

  const viewer = document.createElement('model-viewer');
  viewer.id = 'oc-ar-viewer';
  viewer.setAttribute('src', config.modelUrl);
  viewer.setAttribute('ar', '');
  viewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
  viewer.setAttribute('ar-scale', 'fixed');
  viewer.setAttribute('camera-controls', '');
  viewer.setAttribute('shadow-intensity', '1');
  if (config.title) viewer.setAttribute('alt', config.title);

  viewer.style.position = 'fixed';
  viewer.style.inset = '0';
  viewer.style.width = '100vw';
  viewer.style.height = '100vh';
  viewer.style.zIndex = '10000';
  viewer.style.backgroundColor = 'rgba(0,0,0,0.8)';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close AR';
  closeBtn.style.cssText = 'position:fixed;top:16px;right:16px;z-index:10001;padding:8px 16px;border-radius:8px;border:none;background:#fff;color:#000;font-weight:700;cursor:pointer;font-size:14px;';
  closeBtn.onclick = () => {
    viewer.remove();
    closeBtn.remove();
  };

  document.body.appendChild(viewer);
  document.body.appendChild(closeBtn);

  // Trigger AR automatically if supported
  viewer.addEventListener('load', () => {
    const activateAr = (viewer as HTMLElement & { activateAR?: () => void }).activateAR;
    if (typeof activateAr === 'function') {
      activateAr();
    }
  });
};

/**
 * Export current Three.js scene to GLB for AR usage.
 * This is a helper that should be called from the SceneCanvas capture bridge.
 */
export const exportSceneToGlb = async (
  scene: unknown,
): Promise<Blob | null> => {
  try {
    const { Object3D } = await import('three');
    const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
    void Object3D;

    const exporter = new GLTFExporter();
    return new Promise((resolve) => {
      exporter.parse(
        scene as InstanceType<typeof Object3D>,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: 'model/gltf-binary' }));
          } else {
            const json = JSON.stringify(result);
            resolve(new Blob([json], { type: 'model/gltf+json' }));
          }
        },
        (error) => {
          console.error('GLB export failed:', error);
          resolve(null);
        },
        { binary: true },
      );
    });
  } catch {
    return null;
  }
};
