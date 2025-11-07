import React, { useEffect, useRef } from "react";
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    SceneLoader,
    TransformNode,
    Camera
} from "@babylonjs/core";
import "@babylonjs/loaders";

const TwoDViewer = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        const scene = new Scene(engine);

        // Top-down camera: Maintain consistency with the 3D alpha, fixing only the beta to a top-down perspective.
        const radius = 35;
        const camera = new ArcRotateCamera("cam2D", Math.PI / 2, 0.0001, radius, Vector3.Zero(), scene);
        camera.lowerBetaLimit = 0.0001;
        camera.upperBetaLimit = 0.0001;
        camera.lowerAlphaLimit = Math.PI / 2;
        camera.upperAlphaLimit = Math.PI / 2;
        camera.lowerRadiusLimit = radius;
        camera.upperRadiusLimit = radius;
        camera.panningSensibility = 0;    // Drag and drop is prohibited.

        new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);

        SceneLoader.ImportMesh("", "/models/", "model.obj", scene, (meshes) => {
            const pivot = new TransformNode("pivot", scene);
            meshes.forEach(m => { m.parent = pivot; });

            pivot.rotation.x = Math.PI / 2; // Convert Z-up to Y-up

            // Keyboard rotation
            const step = 0.05;
            const onKey = (e) => {
                if (e.key === "ArrowLeft") pivot.rotation.y -= step;
                if (e.key === "ArrowRight") pivot.rotation.y += step;
            };
            window.addEventListener("keydown", onKey);

            // Drag and rotate with the mouse
            let isDragging = false;
            let lastX = 0;

            const onPointerDown = (e) => {
                isDragging = true;
                lastX = e.clientX;
            };
            const onPointerUp = () => {
                isDragging = false;
            };
            const onPointerMove = (e) => {
                if (!isDragging) return;
                const deltaX = e.clientX - lastX;
                pivot.rotation.y += deltaX * 0.005; // Adjust rotation sensitivity
                lastX = e.clientX;
            };

            canvas.addEventListener("pointerdown", onPointerDown);
            window.addEventListener("pointerup", onPointerUp);
            window.addEventListener("pointermove", onPointerMove);

            scene.onDisposeObservable.add(() => {
                window.removeEventListener("keydown", onKey);
                canvas.removeEventListener("pointerdown", onPointerDown);
                window.removeEventListener("pointerup", onPointerUp);
                window.removeEventListener("pointermove", onPointerMove);
            });
        });

        engine.runRenderLoop(() => scene.render());
        const onResize = () => {
            engine.resize();
        };
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            scene.dispose();
            engine.dispose();
        };
    }, []);

    return (
        <div className="drone-wrapper">
            <canvas ref={canvasRef} className="drone-canvas" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
    );
};

export default TwoDViewer;
