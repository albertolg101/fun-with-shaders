import gsap from "gsap";
import { Color, Group, Raycaster, Scene, Vector2 } from "three";
import { GalleryItem } from "./GalleryItem";
import resources from "./Resources";

const raycaster = new Raycaster();

export class GalleryScene {
  static resources = [
    "blaze",
    "bogged",
    "breeze",
    "creaking",
    "creeper",
    "slime",
    "wither",
    "zombie",
  ];
  static count = GalleryScene.resources.length;

  scene;
  _galery;
  _hasInertia;
  _rotationAnimation;
  _lastWheelDelta;
  _lastZ;
  _lastTime;
  _mouseNDC;

  constructor(renderer) {
    this._init();
    this._hasInertia = false;
    this._rotationAnimation = undefined;
    this._lastWheelDelta = undefined;
    this._mouseNDC = undefined;

    // Init Galeries
    const h = Math.random();
    const colorFrom = new Color();
    colorFrom.setHSL(h, 1, 0.5);
    const colorTo = new Color();
    colorTo.setHSL((h + 0.5) % 1, 1, 0.5);
    this._initGallery(colorFrom, colorTo);
  }

  get degree() {
    return (Math.PI * 2) / GalleryScene.count;
  }

  _init() {
    this.scene = new Scene();
    // this.scene.background = new Color(0xffffff);
  }

  _initGallery(colorFrom, colorTo) {
    const count = this.constructor.count;
    const [width, height] =
      window.innerWidth < window.innerHeight
        ? [
            window.innerWidth * 0.8,
            (window.innerWidth * 0.8) / GalleryItem.aspect,
          ]
        : [
            window.innerHeight * 0.8 * GalleryItem.aspect,
            window.innerHeight * 0.8,
          ];
    const radius = ((count * width) / Math.PI / 2) * 1.5;
    this._galery = new Group();

    this.constructor.resources.forEach((r, index) => {
      const texture = resources.get(r);
      const t = 2 * Math.abs(index / (count - 1) - 0.5);
      const color = colorFrom.clone().lerpHSL(colorTo, t);

      const galeryItem = new GalleryItem(texture, color);
      galeryItem.mesh.scale.setScalar(width);
      galeryItem.mesh.rotateZ(index * this.degree);
      galeryItem.mesh.translateY(radius + height / 2);
      this._galery.add(galeryItem.mesh);
    });

    this._galery.position.y = -1 * (radius + height / 2);
    this.scene.add(this._galery);
  }

  animate(camera) {
    this._galery.children.forEach((child) => {
      child.material.uniforms.uMouse.value.set(0, 0);
    });

    if (this._mouseNDC) {
      raycaster.setFromCamera(this._mouseNDC, camera);
      const intersects = raycaster.intersectObject(this._galery);
      if (intersects.length > 0) {
        console.log(intersects);
        intersects.forEach((intersect) => {
          intersect.object.material.uniforms.uMouse.value.copy(intersect.uv);
        });
      }
    }
  }

  onWheel(e) {
    let delta;
    let velocity;
    let direction;

    if (Math.abs(e.delta[0]) > Math.abs(e.delta[1])) {
      delta = e.delta[0];
      velocity = e.velocity[0];
      direction = e.direction[0];
    } else {
      delta = e.delta[1];
      velocity = e.velocity[1];
      direction = e.direction[1];
    }

    if (
      (this._lastWheelDelta === undefined ||
        Math.abs(delta) > Math.abs(this._lastWheelDelta)) &&
      !this._rotationAnimation
    ) {
      this._galery.rotateZ(delta * 0.0001);
      this._hasInertia = true;
      this._galery.children.forEach(
        (child) =>
          (child.material.uniforms.uVelocity.value = direction * velocity)
      );
    } else {
      if (!this._rotationAnimation && this._hasInertia) {
        const z = this._galery.rotation.z;
        this._galery.children.forEach(
          (child) => (child.material.uniforms.uVelocity.value = direction * 21)
        );
        this._lastZ = z;
        this._lastTime = performance.now();
        this._rotationAnimation = gsap.to(this._galery.rotation, {
          duration: 0.5,
          ease: "power2.out",
          z:
            ((Math.floor(z / this.degree) + (direction > 0)) * this.degree) %
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

  onMove(e) {
    this._mouseNDC = new Vector2(
      (e.values[0] / window.innerWidth) * 2 - 1,
      (e.values[1] / window.innerHeight) * 2 - 1
    );
  }
}
