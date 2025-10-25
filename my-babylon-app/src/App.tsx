import React, { useEffect, useRef } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  SceneLoader,
} from "@babylonjs/core";
import "@babylonjs/loaders";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera("cam", Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);

    SceneLoader.ImportMesh("", "/models/", "model.obj", scene, (meshes) => {
      const model = meshes[0];
      model.position = Vector3.Zero();
      model.scaling = new Vector3(1, 1, 1);

      const step = 0.05;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") model.rotation.y -= step;
        if (e.key === "ArrowRight") model.rotation.y += step;
        if (e.key === "ArrowUp") model.rotation.x -= step;
        if (e.key === "ArrowDown") model.rotation.x += step;
      };
      window.addEventListener("keydown", onKey);
      scene.onDisposeObservable.add(() => window.removeEventListener("keydown", onKey));
    });

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
};

export default App;
