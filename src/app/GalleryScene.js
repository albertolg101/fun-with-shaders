import gsap from "gsap";
import {
  Color,
  Group,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
} from "three";

import vertex from "./shaders/index.vert";
import fragment from "./shaders/index.frag";

export class GalleryScene {
  scene;
  PLANE_GEOMETRY;
  _count;
  _galery;
  _hasInertia;
  _rotationAnimation;
  _lastWheelDelta;
  _lastZ;
  _lastTime;

  constructor(renderer) {
    this._init();
    this._hasInertia = false;
    this._rotationAnimation = undefined;
    this._lastWheelDelta = undefined;

    // Init Galeries
    const colorFrom = new Color();
    colorFrom.setHSL(Math.random(), 1, 0.5);
    const colorTo = new Color();
    colorTo.setHSL(Math.random(), 1, 0.5);
    this._count = 16;
    this._initGallery(colorFrom, colorTo);
  }

  get degree() {
    return (Math.PI * 2) / this._count;
  }

  _init() {
    const height = window.innerHeight * 0.8;
    const width = (height / 7) * 5;

    this.PLANE_GEOMETRY = new PlaneGeometry(width, height, 3, 10);
    this.scene = new Scene();
    // this.scene.background = new Color(0xffffff);
  }

  _initGallery(colorFrom, colorTo) {
    const height = this.PLANE_GEOMETRY.parameters.height;
    const width = this.PLANE_GEOMETRY.parameters.width;
    const radius = ((this._count * width) / Math.PI / 2) * 1.5;
    this._galery = new Group();

    for (let i = 0; i < this._count; i++) {
      const t = Math.abs(2 * (i / (this._count - 1) - 0.5));
      const color = colorFrom.clone().lerp(colorTo, t);

      const mat = new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uColor: { value: color },
          uVelocity: { value: 0 },
        },
      });

      const mesh = new Mesh(this.PLANE_GEOMETRY, mat);

      mesh.rotateZ(i * this.degree);
      mesh.translateY(radius + height / 2);
      this._galery.add(mesh);
    }

    this._galery.position.y = -1 * (radius + height / 2);
    this.scene.add(this._galery);
  }

  animate() {}

  onWheel(e) {
    const delta = e.delta[1];
    if (e.elapsedTime === 0) console.log(e);
    console.log(this._rotationAnimation);

    if (
      (this._lastWheelDelta === undefined ||
        Math.abs(delta) > Math.abs(this._lastWheelDelta)) &&
      !this._rotationAnimation
    ) {
      this._galery.rotateZ(delta * 0.0001);
      this._hasInertia = true;
      this._galery.children.forEach(
        (child) =>
          (child.material.uniforms.uVelocity.value =
            e.direction[1] * e.velocity[1])
      );
    } else {
      if (!this._rotationAnimation && this._hasInertia) {
        const z = this._galery.rotation.z;
        this._galery.children.forEach(
          (child) =>
            (child.material.uniforms.uVelocity.value = e.direction[1] * 21)
        );
        this._lastZ = z;
        this._lastTime = performance.now();
        this._rotationAnimation = gsap.to(this._galery.rotation, {
          duration: 0.5,
          ease: "power2.out",
          z:
            ((Math.floor(z / this.degree) + (e.direction[1] > 0)) *
              this.degree) %
            (Math.PI * 2),
          onUpdate: () => {
            const time = performance.now();
            const dt = time - this._lastTime;
            const dz = this._galery.rotation.z - this._lastZ;
            this._lastTime = time;
            this._lastZ = this._galery.rotation.z;
            const v = dz / dt;
            this._galery.children.forEach((child) => {
              child.material.uniforms.uVelocity.value = v * 10000;
            });
          },
          onComplete: () => {
            this._rotationAnimation = undefined;
            this._hasInertia = false;
          },
        });
      }
    }

    this._lastWheelDelta = delta;
  }
}
