// types/googletag.d.ts
declare global {
  interface Window {
    googletag: {
      cmd: Array<() => void>;
      defineSlot: (adUnitPath: string, size: [number, number], div: string) => {
        addService: (service: any) => any;
      } | null;
      pubads: () => any;
      enableServices: () => void;
      display: (div: string) => void;
    };
  }
}

export {};