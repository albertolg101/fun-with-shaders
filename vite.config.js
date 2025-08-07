import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://albertolg101.github.io/fun-with-shaders",
  plugins: [glsl()],
});
