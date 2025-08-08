import { MoveGesture, WheelGesture } from "@use-gesture/vanilla";

import "./style.css";
import { App } from "./app";

const app = new App();
const canvas = document.querySelector("#canvas");

const wheelGesture = WheelGesture(canvas, app.onWheel.bind(app));
const moveGesture = MoveGesture(canvas, app.onMove.bind(app));
