import {
  Clock,
  HalfFloatType,
  MathUtils,
  PerspectiveCamera,
  WebGLRenderer,
} from "three";
import Stats from "stats.js";
import { GalleryScene } from "./GalleryScene";
import { EffectComposer, RenderPass } from "postprocessing";
import resources from "./Resources";

export class App {
  _renderer;
  _camera;
  _scene;
  _composer;
  _clock;
  _stats;

  constructor() {
    this._init();
    this._load();
  }

  _init() {
    this._renderer = new WebGLRenderer({
      canvas: document.querySelector("#canvas"),
    });

    const distance = 1;
    const fov = Math.atan(window.innerHeight / 2 / distance) * 2;
    this._camera = new PerspectiveCamera(
      MathUtils.radToDeg(fov),
      window.innerWidth / window.innerHeight,
      0.1,
      50
    );
    this._camera.position.set(0, 0, distance);
    this._camera.lookAt(0, 0, 0);

    this._clock = new Clock();
    this._clock.autoStart = true;

    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // new OrbitControls(this._camera, this._renderer.domElement);
  }

  async _load() {
    await resources.load();
    this._initScene();
    this._initEvents();
    this._resize();
    this._animate();
  }

  _initScene() {
    this._scene = new GalleryScene(this._renderer);
    this._composer = new EffectComposer(this._renderer, {
      frameBufferType: HalfFloatType,
    });
    this._composer.addPass(new RenderPass(this._scene.scene, this._camera));
  }

  _initEvents() {
    window.addEventListener("resize", this._resize.bind(this));
  }

  _resize() {
    // Set device pixel ratio
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // Resize canvas
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    // Resize composer
    this._composer.setSize(window.innerWidth, window.innerHeight);

    // Resize camera
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
  }

  _animate() {
    this._stats.begin();

    // this._renderer.render(this._scene.scene, this._camera);
    this._scene.animate(this._camera, this._clock);
    this._composer.render();

    this._stats.end();
    window.requestAnimationFrame(this._animate.bind(this));
  }

  onWheel(e) {
    this._scene.onWheel(e);
  }

  onMove(e) {
    this._scene.onMove(e);
  }

  onDrag(e) {
    this._scene.onDrag(e);
  }

  onPointerDown(e) {
    this._scene.onPointerDown(e, this._camera);
  }

  onPointerUp(e) {
    this._scene.onPointerUp(e, this._camera);
  }
}
