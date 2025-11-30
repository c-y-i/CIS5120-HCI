import React, { useEffect, useRef } from "react";
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    SceneLoader,
    TransformNode
} from "@babylonjs/core";
import "@babylonjs/loaders";

const TwoDViewer = ({ modelUrl }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        const scene = new Scene(engine);

        // Top-down camera: Maintain consistency with the 3D alpha, fixing only the beta to a top-down perspective.
        const radius = 360;
        const camera = new ArcRotateCamera("cam2D", Math.PI / 2, 0.0001, radius, Vector3.Zero(), scene);
        camera.lowerBetaLimit = 0.0001;
        camera.upperBetaLimit = 0.0001;
        camera.lowerAlphaLimit = Math.PI / 2;
        camera.upperAlphaLimit = Math.PI / 2;
        camera.lowerRadiusLimit = radius;
        camera.upperRadiusLimit = radius;
        camera.panningSensibility = 0;    // Drag and drop is prohibited.

        new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);

        let isDragging = false;
        let lastX = 0;
        const rotationStep = 0.05;
        let pivotNode = null;

        const onKey = (e) => {
            if (!pivotNode) return;
            if (e.key === "ArrowLeft") pivotNode.rotation.y -= rotationStep;
            if (e.key === "ArrowRight") pivotNode.rotation.y += rotationStep;
        };

        const onPointerDown = (e) => {
            if (!pivotNode) return;
            isDragging = true;
            lastX = e.clientX;
        };

        const onPointerUp = () => {
            isDragging = false;
        };

        const onPointerMove = (e) => {
            if (!isDragging || !pivotNode) return;
            const deltaX = e.clientX - lastX;
            pivotNode.rotation.y += deltaX * 0.005;
            lastX = e.clientX;
        };

        const attachInputHandlers = () => {
            window.addEventListener("keydown", onKey);
            canvas.addEventListener("pointerdown", onPointerDown);
            window.addEventListener("pointerup", onPointerUp);
            window.addEventListener("pointermove", onPointerMove);
        };

        const detachInputHandlers = () => {
            window.removeEventListener("keydown", onKey);
            canvas.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointermove", onPointerMove);
        };

        const loadModel = async () => {
            if (!modelUrl) return;
            try {
                const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);
                const pivot = new TransformNode("pivot", scene);
                result.meshes.forEach(m => {
                    if (!m.name.startsWith("__")) {
                        m.parent = pivot;
                    }
                });
                pivot.rotation.x = Math.PI / 2; // Convert Z-up to Y-up
                pivotNode = pivot;
                attachInputHandlers();
            } catch (err) {
                console.error("[TwoDViewer] Failed to load model", modelUrl, err);
            }
        };

        loadModel();

        engine.runRenderLoop(() => scene.render());
        const onResize = () => {
            engine.resize();
        };
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            detachInputHandlers();
            scene.dispose();
            engine.dispose();
        };
    }, [modelUrl]);

    return (
        <div className="drone-wrapper">
            <canvas ref={canvasRef} className="drone-canvas" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
    );
};

TwoDViewer.defaultProps = {
    modelUrl: null,
};

export default TwoDViewer;
