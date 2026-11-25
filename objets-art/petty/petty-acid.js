// Step 3 replaces this stub with the acid layer.
export function createAcid(B) {
  const noop = () => {};
  return { onLaunch: noop, onCosmos: noop, frame: noop, onPop: noop, onCatch: noop, onLevel: noop, onSacred: noop, onNudge: noop,
    onEgoDeath() { B.canvas.style.filter = "grayscale(1)"; }, onLanded() { B.canvas.style.filter = ""; } };
}
