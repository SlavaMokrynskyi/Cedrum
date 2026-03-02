export {};

declare global {
  namespace chrome {
    const sidePanel: {
      open(options: { tabId?: number; windowId?: number }): Promise<void>;
      setOptions(options: {
        tabId?: number;
        path?: string;
        enabled?: boolean;
      }): Promise<void>;
      setPanelBehavior(options: { 
        openPanelOnActionClick?: boolean 
      }): Promise<void>;
    };

    namespace storage {
      const session: StorageArea;

      interface StorageArea {
        get(keys?: string | string[] | Record<string, any> | null): Promise<Record<string, any>>;
        set(items: Record<string, any>): Promise<void>;
        remove(keys: string | string[]): Promise<void>;
        clear(): Promise<void>;
      }
    }
  }
}