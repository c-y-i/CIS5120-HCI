import React, { useEffect, useRef, useState } from "react";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader } from "@babylonjs/core";
import "@babylonjs/loaders"; // glTF/GLB loaders

/**
 * BabylonViewer component
 * Props:
 *  - modelUrl: string (single model to load)
 *  - modelUrls: string[] (multiple models to load)
 *  - autoRotate: boolean (auto spin models)
 *  - onLoaded: (count: number) => void callback after models loaded
 *  - frameSize: number (mm diagonal motor-to-motor) used to position motors
 *  - motorUrl: string (source model for a single motor; cloned to 4 corners)
 *  - batteryUrl, fcUrl, escUrl, receiverUrl: optional individual component URLs (center stacked)
 */
const BabylonViewer = ({
  modelUrl,
  modelUrls = [],
  autoRotate = true,
  onLoaded,
  frameSize,
  motorUrl,
  batteryUrl,
  fcUrl,
  escUrl,
  receiverUrl,
  propellerUrl,
  groundClearance = 2, // millimeters to lift lowest point above ground
  resetKey = 0,
  debug = false,
  clearedComponents = [] // array of component type strings to remove (e.g. ['frame','motor'])
}) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const cameraRef = useRef(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const normalizeTimerRef = useRef(null);
  const [loadStatuses, setLoadStatuses] = useState({});
  const previousUrlsRef = useRef(null);
  const pendingLoadsRef = useRef(0);

  // Initialize engine + scene once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    engineRef.current = engine;
    sceneRef.current = scene;

    // Camera - start very close then auto-fit once models load
    const camera = new ArcRotateCamera("cam", Math.PI / 2, Math.PI / 2.4, 0.5, Vector3.Zero(), scene);    
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 0.01;    // Allow very close zoom
    camera.upperRadiusLimit = 80;   // Still cap far zoom
    camera.wheelPrecision = 100;     // Smooth zoom
    camera.panningSensibility = 75; // Enable panning comfortably
    camera.useNaturalPinchZoom = true;
    camera.minZ = 0.01; // prevent clipping for close radius
    camera.maxZ = 10000;
    cameraRef.current = camera;

    // Lighting - brighter and more directional for better visibility
    const hemiLight = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.8;
    const hemiLight2 = new HemisphericLight("hemi2", new Vector3(0, -1, 0.5), scene);
    hemiLight2.intensity = 0.5; // Fill light from below/side

    // Render loop
    engine.runRenderLoop(() => {
      if (autoRotate && scene.meshes) {
        scene.meshes.forEach(m => { if (m.metadata?.autoSpin) m.rotation.y += 0.002; });
      }
      scene.render();
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scene.dispose();
      engine.dispose();
    };
  }, [autoRotate]);

  // Utility: compute quad motor positions from diagonal (frameSize)
  const computeMotorPositions = (diag) => {
    if (!diag || diag <= 0) return [];
    const side = diag / Math.sqrt(2); // side length of square
    const h = side / 2;
    // Y axis up; place motors slightly above ground (y=0)
    return [
      new Vector3( h, 0,  h),
      new Vector3(-h, 0,  h),
      new Vector3(-h, 0, -h),
      new Vector3( h, 0, -h)
    ];
  };

  // Helper: fit camera to current scene meshes
  const fitCameraToScene = (paddingFactor = 1.5) => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;
    
    const meshes = scene.meshes.filter(m => !m.name.startsWith("__") && m.isVisible && m.getBoundingInfo);
    if (!meshes.length) return;

    // 1. Calculate the bounding box of all meshes
    let minVec = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    let maxVec = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

    meshes.forEach(m => {
      // Update the mesh world matrix to ensure bounds are accurate
      m.computeWorldMatrix(true); 
      const info = m.getBoundingInfo();
      const bmin = info.boundingBox.minimumWorld;
      const bmax = info.boundingBox.maximumWorld;

      minVec.x = Math.min(minVec.x, bmin.x);
      minVec.y = Math.min(minVec.y, bmin.y);
      minVec.z = Math.min(minVec.z, bmin.z);
      maxVec.x = Math.max(maxVec.x, bmax.x);
      maxVec.y = Math.max(maxVec.y, bmax.y);
      maxVec.z = Math.max(maxVec.z, bmax.z);
    });

    const sizeVec = maxVec.subtract(minVec);
    const center = minVec.add(sizeVec.scale(0.5));
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);

    // 2. Center the camera on the object
    camera.target = center;

    // 3. Calculate distance needed to fit object
    // If maxDim is 0.2 (20cm), radius becomes ~0.3
    let desiredRadius = maxDim * paddingFactor;
    
    // Safety check for "ghost" meshes or empty scenes
    if (desiredRadius < 0.01) desiredRadius = 5; 

    camera.radius = desiredRadius;

    // 4. ADJUST LIMITS DYNAMICALLY (Crucial Step)
    // Allow zooming much closer than the object size
    camera.lowerRadiusLimit = desiredRadius * 0.1; 
    // Don't allow zooming out to infinity
    camera.upperRadiusLimit = desiredRadius * 10; 
    
    // 5. Fix clipping so it doesn't disappear
    camera.minZ = desiredRadius * 0.01;
    camera.maxZ = desiredRadius * 1000; 
  };
  // Normalize Y so lowest point sits at ground (y=0) with slight clearance
  const normalizeSceneY = (clearance = 0) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const meshes = scene.meshes.filter(m => !m.name.startsWith("__") && m.isVisible && m.getBoundingInfo);
    if (!meshes.length) return;
    let minY = Number.POSITIVE_INFINITY;
    meshes.forEach(m => {
      const info = m.getBoundingInfo();
      minY = Math.min(minY, info.boundingBox.minimumWorld.y);
    });
    if (minY === Number.POSITIVE_INFINITY) return;
    const offset = -minY + clearance;
    if (Math.abs(offset) < 1e-3) return; // already fine
    meshes.forEach(m => {
      m.position.y += offset;
    });
  };

  // Debounce normalization to run after all loads complete
  const scheduleNormalization = () => {
    if (normalizeTimerRef.current) clearTimeout(normalizeTimerRef.current);
    normalizeTimerRef.current = setTimeout(() => {
      normalizeSceneY(groundClearance);
      fitCameraToScene(); // refit after vertical shift
    }, 120); // small delay to allow subsequent loads/clones
  };

  // Load models & layout when dependencies change or reset triggered
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous non-system meshes
    // Dispose only if URL set changed
    const currentUrlSet = JSON.stringify({
      dynamic: modelUrls,
      motorUrl,
      batteryUrl,
      fcUrl,
      escUrl,
      receiverUrl,
      propellerUrl
    });
    // Force dispose if resetKey changed explicitly
    const resetTriggered = resetKey !== (scene.__lastResetKey || 0);
    if (resetTriggered) {
      scene.__lastResetKey = resetKey;
    }

    if (previousUrlsRef.current !== currentUrlSet || resetTriggered) {
      const meshesToDispose = scene.meshes.filter(m => !m.name.startsWith("__"));
      meshesToDispose.forEach(m => m.dispose());
      previousUrlsRef.current = currentUrlSet;
    }
    setLoadedCount(0);

    const dynamicUrls = modelUrls.length ? [...modelUrls] : (modelUrl ? [modelUrl] : []);

    // Remove meshes for cleared component types before any new loads
    if (clearedComponents.length) {
      scene.meshes.forEach(m => {
        const t = m.metadata?.componentType;
        if (t && clearedComponents.includes(t)) {
          m.dispose();
        }
      });
    }

    // If no URLs and all component URLs are null, exit early after ensuring scene cleared
    const noComponentUrls = !motorUrl && !batteryUrl && !fcUrl && !escUrl && !receiverUrl && !propellerUrl && dynamicUrls.length === 0;
    if (noComponentUrls) {
      fitCameraToScene(); // optional small camera reset
      return; // nothing to load
    }

    const markStatus = (url, status, info) => {
      setLoadStatuses(prev => ({ ...prev, [url]: { status, info }}));
    };

    const preflight = async (url) => {
      try {
        const headResp = await fetch(url, { method: 'HEAD' });
        if (!headResp.ok) {
          markStatus(url, 'error', `HEAD ${headResp.status}`);
          return false;
        }
        markStatus(url, 'pending', 'fetching');
        return true;
      } catch (e) {
        markStatus(url, 'error', e.message);
        return false;
      }
    };

    const loadSingle = async (url, cb, componentType) => {
      if (!url) return;
      const ok = await preflight(url);
      if (!ok) return;
      pendingLoadsRef.current += 1;
      const meshCountBefore = scene.meshes.length;
      SceneLoader.Append("", url, scene, () => {
        const newMeshes = scene.meshes.slice(meshCountBefore);
        
        // Mark all new meshes for auto-rotation
        newMeshes.forEach(m => { 
          if (!m.name.startsWith("__")) {
            m.metadata = { ...(m.metadata || {}), autoSpin: true };
            if (componentType) m.metadata.componentType = componentType;
            m.metadata.sourceUrl = url;
          }
        });
        
        setLoadedCount(prev => {
          const next = prev + 1;
          if (onLoaded) onLoaded(next);
          return next;
        });
        
        if (newMeshes.length === 0) {
          markStatus(url, 'error', 'No meshes loaded');
        } else {
          markStatus(url, 'success', `${newMeshes.length} mesh(es)`);
        }
        if (cb) cb(newMeshes);
        // After each successful load schedule normalization & fit
        pendingLoadsRef.current -= 1;
        if (pendingLoadsRef.current === 0) {
          // scheduleNormalization();
        }
      }, null, (s, msg, exception) => {
        console.error("Failed to load model:", url, exception || msg);
        markStatus(url, 'error', (exception && exception.message) || msg || 'Load failed');
        pendingLoadsRef.current -= 1;
        if (pendingLoadsRef.current === 0) {
          // scheduleNormalization();
        }
      });
    };

    // Load non-motor components first (centered)
    dynamicUrls.forEach(url => loadSingle(url, null));

    // Dynamic vertical stacking: compress gaps when some components missing
    const stackSpacing = 3; // mm spacing between stacked components
    const stackComponents = [fcUrl, escUrl, receiverUrl, batteryUrl].filter(Boolean);
    stackComponents.forEach((url, idx) => {
      const offsetY = idx * stackSpacing;
      const typeMap = { [fcUrl]: 'flight_controller', [escUrl]: 'esc', [receiverUrl]: 'receiver', [batteryUrl]: 'battery' };
      loadSingle(url, (meshes) => {
        meshes.forEach(m => {
          if (!m.parent && !m.name.startsWith("__")) {
            m.position.y = offsetY;
          }
        });
      }, typeMap[url]);
    });

    const motorPositions = frameSize ? computeMotorPositions(frameSize) : [];

    // Load motor, then clone to four corners (if frame selected)
    if (motorUrl && motorPositions.length) {
      loadSingle(motorUrl, (loadedMeshes) => {
        // Find root-level meshes (those without parents)
        const rootMeshes = loadedMeshes.filter(m => !m.parent && !m.name.startsWith("__"));
        
        if (rootMeshes.length === 0) return;
        
        // Position first motor at first position
        rootMeshes.forEach(m => m.position = motorPositions[0]);
        
        // Clone for remaining positions
        for (let i = 1; i < motorPositions.length; i++) {
          rootMeshes.forEach(mesh => {
            const clone = mesh.clone(`motor_${i}_${mesh.name}`, null);
            if (clone) {
              clone.position = motorPositions[i];
              clone.metadata = { ...(clone.metadata || {}), autoSpin: true };
            }
          });
        }
        // normalization triggered once all loads finished above
      }, 'motor');
    }

    // Load propeller - clone with motors if available, otherwise load standalone
    if (propellerUrl) {
      if (motorPositions.length) {
        // Clone above each motor
        loadSingle(propellerUrl, (loadedMeshes) => {
          const rootMeshes = loadedMeshes.filter(m => !m.parent && !m.name.startsWith("__"));
          
          if (rootMeshes.length === 0) return;
          
          // Position first propeller above first motor
          const propOffset = new Vector3(0, 2, 0);
          rootMeshes.forEach(m => m.position = motorPositions[0].add(propOffset));
          
          // Clone for remaining positions
          for (let i = 1; i < motorPositions.length; i++) {
            rootMeshes.forEach(mesh => {
              const clone = mesh.clone(`prop_${i}_${mesh.name}`, null);
              if (clone) {
                clone.position = motorPositions[i].add(propOffset);
                clone.metadata = { ...(clone.metadata || {}), autoSpin: true };
              }
            });
          }
        }, 'propeller');
      } else {
        // Load single propeller at center when no frame/motors
        loadSingle(propellerUrl, null, 'propeller');
      }
    }
  }, [modelUrl, modelUrls, frameSize, motorUrl, batteryUrl, fcUrl, escUrl, receiverUrl, propellerUrl, onLoaded, groundClearance, resetKey, clearedComponents]);

  return (
    <div style={{ width: "100%", height: "400px", border: "1px solid #222", borderRadius: 8, overflow: "hidden", background: "#111", position:'relative' }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {debug && (
        <div style={{ position:'absolute', top:8, left:8, background:'rgba(0,0,0,0.6)', padding:'6px 8px', fontSize:11, color:'#eee', maxWidth:260, overflowY:'auto', maxHeight:180 }}>
          <div style={{ fontWeight:'600', marginBottom:4 }}>Model Load Status</div>
          {Object.keys(loadStatuses).length === 0 && <div>Waiting...</div>}
          {Object.entries(loadStatuses).map(([url, info]) => (
            <div key={url} style={{ marginBottom:4 }}>
              <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{url}</div>
              <div style={{ color: info.status==='success' ? '#4caf50' : info.status==='error' ? '#f44336' : '#ffb300' }}>
                {info.status}: {info.info}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BabylonViewer;
