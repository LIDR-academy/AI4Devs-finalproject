import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Test preload: install happy-dom's document/window/etc. as globals so VanJS,
// which builds real DOM nodes, can run under `bun test`. A concrete URL is given
// so History-API navigation (router) resolves relative paths. See bunfig.toml.
GlobalRegistrator.register({ url: "http://localhost/" });
