import vertex from "./shaders/GalleryItem.vert";
import fragment from "./shaders/GalleryItem.frag";
import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from "three";

export class GalleryItem {
  static PLANE_GEOMETRY = new PlaneGeometry(1, 8 / 5, 20, 20);
  mesh;

  constructor(texture, color) {
    this._init(texture, color);
  }

  static get height() {
    return GalleryItem.PLANE_GEOMETRY.parameters.height;
  }

  static get width() {
    return GalleryItem.PLANE_GEOMETRY.parameters.width;
  }

  static get aspect() {
    return GalleryItem.width / GalleryItem.height;
  }

  _init(texture, color) {
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uAspect: { value: this.constructor.aspect },
        uTextureAspect: { value: texture.width / texture.height },
        uTexture: { value: texture },
        uColor: { value: color },
        uVelocity: { value: 0 },
        uMouse: { value: new Vector2() },
        uTime: { value: 0 },
        uBend: { value: 0 },
        uMouseRadio: { value: 0.3 },
      },
    });

    this.mesh = new Mesh(GalleryItem.PLANE_GEOMETRY, material);
  }
}
