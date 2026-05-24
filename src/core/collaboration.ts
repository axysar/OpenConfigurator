/**
 * Real-Time Collaboration Engine
 *
 * Provides multi-user editing via a WebSocket transport. When a backend
 * collaboration server is configured (__OC_COLLAB_WS__), users can:
 *   - Share a live session URL
 *   - See each other's cursor / active step
 *   - Receive real-time spec updates with last-write-wins merge
 *
 * The protocol is intentionally simple (JSON messages over WS):
 *   → { type: 'join', sessionId, user }
 *   → { type: 'spec_update', spec, userId }
 *   → { type: 'cursor', userId, stepId }
 *   ← { type: 'state', spec, users }
 *   ← { type: 'user_joined', user }
 *   ← { type: 'user_left', userId }
 *   ← { type: 'spec_update', spec, userId }
 *   ← { type: 'cursor', userId, stepId }
 */

export interface CollabUser {
  id: string;
  name: string;
  color: string;
  activeStep?: string;
}

export interface CollabState {
  sessionId: string;
  users: CollabUser[];
  connected: boolean;
}

type CollabListener = (state: CollabState) => void;
type SpecListener = (spec: Record<string, unknown>, fromUserId: string) => void;

const COLLAB_COLORS = ['#8fd0ff', '#ff8b94', '#6ee7a3', '#f6c768', '#c49cff', '#ff9f43'];

export class CollaborationSession {
  private ws: WebSocket | null = null;
  private state: CollabState;
  private listeners = new Set<CollabListener>();
  private specListeners = new Set<SpecListener>();
  private userId: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private wsUrl: string,
    private sessionId: string,
    private userName: string,
  ) {
    this.userId = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    this.state = { sessionId, users: [], connected: false };
  }

  connect(): void {
    if (this.ws) return;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.send({
          type: 'join',
          sessionId: this.sessionId,
          user: { id: this.userId, name: this.userName, color: this.pickColor() },
        });
        this.updateState({ connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as Record<string, unknown>;
          this.handleMessage(msg);
        } catch { /* ignore malformed messages */ }
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.updateState({ connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.updateState({ connected: false, users: [] });
  }

  sendSpecUpdate(spec: Record<string, unknown>): void {
    this.send({ type: 'spec_update', spec, userId: this.userId });
  }

  sendCursor(stepId: string): void {
    this.send({ type: 'cursor', userId: this.userId, stepId });
  }

  onStateChange(listener: CollabListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onSpecUpdate(listener: SpecListener): () => void {
    this.specListeners.add(listener);
    return () => this.specListeners.delete(listener);
  }

  getState(): CollabState {
    return this.state;
  }

  getUserId(): string {
    return this.userId;
  }

  private send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(msg: Record<string, unknown>): void {
    switch (msg.type) {
      case 'state':
        this.updateState({ users: msg.users as CollabUser[] });
        if (msg.spec) {
          for (const listener of this.specListeners) {
            listener(msg.spec as Record<string, unknown>, 'server');
          }
        }
        break;
      case 'user_joined':
        this.updateState({
          users: [...this.state.users, msg.user as CollabUser],
        });
        break;
      case 'user_left':
        this.updateState({
          users: this.state.users.filter((u) => u.id !== msg.userId),
        });
        break;
      case 'spec_update':
        if (msg.userId !== this.userId) {
          for (const listener of this.specListeners) {
            listener(msg.spec as Record<string, unknown>, msg.userId as string);
          }
        }
        break;
      case 'cursor':
        this.updateState({
          users: this.state.users.map((u) =>
            u.id === msg.userId ? { ...u, activeStep: msg.stepId as string } : u,
          ),
        });
        break;
    }
  }

  private updateState(patch: Partial<CollabState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  private pickColor(): string {
    return COLLAB_COLORS[this.state.users.length % COLLAB_COLORS.length];
  }
}

const COLLAB_WS_URL = typeof window !== 'undefined'
  ? (window as unknown as Record<string, unknown>).__OC_COLLAB_WS__ as string | undefined
  : undefined;

export const isCollaborationAvailable = (): boolean => Boolean(COLLAB_WS_URL);

export const createCollaborationSession = (
  sessionId: string,
  userName: string,
): CollaborationSession | null => {
  if (!COLLAB_WS_URL) return null;
  return new CollaborationSession(COLLAB_WS_URL, sessionId, userName);
};
