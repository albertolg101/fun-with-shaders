import {
  EquirectangularReflectionMapping,
  TextureLoader,
  VideoTexture,
} from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const ASSETS = [
  {
    key: "blaze",
    path: "blaze.webm",
    type: "video",
  },
  {
    key: "bogged",
    path: "bogged.png",
    type: "texture",
  },
  {
    key: "breeze",
    path: "breeze.webm",
    type: "video",
  },
  {
    key: "creaking",
    path: "creaking.png",
    type: "texture",
  },
  {
    key: "creeper",
    path: "creeper.png",
    type: "texture",
  },
  {
    key: "slime",
    path: "slime.png",
    type: "texture",
  },
  {
    key: "wither",
    path: "wither.png",
    type: "texture",
  },
  {
    key: "zombie",
    path: "zombie.png",
    type: "texture",
  },
];

class Resources {
  #resources;
  #loaders;

  constructor() {
    this.#resources = new Map();

    this.#loaders = {
      tl: new TextureLoader(),
      gltf: new GLTFLoader(),
      rgbe: new RGBELoader(),
    };
  }

  get(v) {
    return this.#resources.get(v);
  }

  async load() {
    const promises = ASSETS.map((el) => {
      let prom = undefined;

      if (el.type === "texture") {
        prom = new Promise((res) => {
          this.#loaders.tl.load(el.path, (texture) => {
            this.#resources.set(el.key, texture);
            res();
          });
        });
      } else if (el.type === "gltf") {
        prom = new Promise((res) => {
          this.#loaders.gltf.load(el.path, (model) => {
            this.#resources.set(el.key, model);
            res();
          });
        });
      } else if (el.type === "envmap") {
        prom = new Promise((res) => {
          this.#loaders.rgbe.load(el.path, (texture) => {
            this.#resources.set(el.key, texture);
            texture.mapping = EquirectangularReflectionMapping;
            res();
          });
        });
      } else if (el.type === "video") {
        prom = new Promise((res) => {
          const video = document.createElement("video");
          video.width = 0;
          video.height = 0;
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.preload = "auto";
          video.style.display = "none";
          video.src = el.path;
          video.type = "video/mp4";

          document.body.appendChild(video);

          video.addEventListener("loadedmetadata", () => {
            const videoTexture = new VideoTexture(video);
            this.#resources.set(el.key, videoTexture);
            video.play();
            res();
          });

          video.load();
        });
      }

      // return prom
      return prom;
    });

    await Promise.all(promises);
  }
}

const resources = new Resources();

export default resources;
