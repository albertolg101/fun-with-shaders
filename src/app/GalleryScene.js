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
  _verticalDelta;
  _wasRaycastedOnPointerDown;

  constructor(renderer) {
    this._init();
    this._hasInertia = false;
    this._rotationAnimation = undefined;
    this._lastWheelDelta = undefined;
    this._mouseNDC = undefined;
    this._verticalDelta = 0;
    this._wasRaycastedOnPointerDown = new Set();

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

  animate(camera, clock) {
    this._galery.children.forEach((child) => {
      child.material.uniforms.uMouseRadio.value = Math.max(
        Math.min(
          child.material.uniforms.uMouseRadio.value +
            this._verticalDelta * 0.01,
          1.0
        ),
        0.001
      );
      child.material.uniforms.uTime.value = clock.getElapsedTime();
      child.material.uniforms.uMouse.value.set(-1, -1);
      if (this._mouseNDC) {
        raycaster.setFromCamera(this._mouseNDC, camera);
        const intersect = raycaster.intersectObject(child);
        if (intersect.length > 0) {
          child.material.uniforms.uMouse.value.copy(intersect[0].uv);
        }
      }
    });

    this._verticalDelta = 0;
  }

  startRotation(direction) {
    const z = this._galery.rotation.z;
    this._galery.children.forEach(
      (child) => (child.material.uniforms.uVelocity.value = direction * 21)
    );
    this._lastZ = z;
    this._lastTime = performance.now();
    this._rotationAnimation = gsap.to(this._galery.rotation, {
      duration: 0.5,
      ease: "power2.out",
      z: (Math.floor((z + 1e-6) / this.degree) + direction) * this.degree,
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
        this._galery.rotation.z %= Math.PI * 2;
      },
    });
  }

  onWheel(e) {
    this.onVerticalScroll(e);
    this.onHorizontalScroll(e);
  }

  onDrag(e) {
    if (Math.abs(e.movement[0]) > 1 && !this._rotationAnimation) {
      this._hasInertia = true;
      this.startRotation(-1 * e.direction[0]);
    }
  }

  onVerticalScroll(e) {
    this._verticalDelta += e.delta[1];
  }

  onHorizontalScroll(e) {
    const delta = e.delta[0];
    const velocity = e.velocity[0];
    const direction = e.direction[0];

    if (
      Math.abs(delta) > 50 &&
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
        this.startRotation(direction > 0);
      }
    }

    this._lastWheelDelta = delta;
  }

  onMove(e) {
    this._mouseNDC = new Vector2(
      (e.values[0] / window.innerWidth) * 2 - 1,
      1 - (e.values[1] / window.innerHeight) * 2
    );
  }

  onPointerDown(e, camera) {
    const mouseNDC = new Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      1 - (e.clientY / window.innerHeight) * 2
    );

    this._galery.children.forEach((child) => {
      raycaster.setFromCamera(mouseNDC, camera);
      const intersect = raycaster.intersectObject(child);
      if (intersect.length > 0) {
        this._wasRaycastedOnPointerDown.add(child.uuid);
      }
    });
  }

  onPointerUp(e, camera) {
    const mouseNDC = new Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      1 - (e.clientY / window.innerHeight) * 2
    );

    this._galery.children.forEach((child) => {
      raycaster.setFromCamera(mouseNDC, camera);
      const intersect = raycaster.intersectObject(child);
      if (intersect.length > 0) {
        if (this._wasRaycastedOnPointerDown.has(child.uuid)) {
          child.material.uniforms.uBend.value ^= 1;
        }
      }

      this._wasRaycastedOnPointerDown.delete(child.uuid);
    });
  }
}
