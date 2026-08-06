/// <reference types="vite/client" />

declare module "@landing/*" {
  const component: React.ComponentType<Record<string, unknown>>;
  export default component;
}

declare module "@landing/*.css" {
  const css: string;
  export default css;
}
