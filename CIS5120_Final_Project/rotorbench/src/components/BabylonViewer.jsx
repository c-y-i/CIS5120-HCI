import React, { useEffect, useRef, useState } from "react";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, TransformNode } from "@babylonjs/core";
import "@babylonjs/loaders"; // glTF/GLB loaders

/**
 * BabylonViewer component
 * Props:
 *  - modelUrl: string (single model to load)
 *  - modelUrls: string[] (multiple models to load)
 *  - autoRotate: boolean (auto spin models)
 *  - onLoaded: (count: number) => void callback after models loaded
 *  - frameCornerPositions: array of 4 Vector3-like objects [{x,y,z},...] for motor placement
 *  - motorUrl: string (source model for a single motor; cloned to 4 corners)
 *  - motorMountingPoint: [x,y,z] offset from motor model origin to mounting point
 *  - batteryUrl, fcUrl, escUrl, receiverUrl: optional individual component URLs (center stacked)
 */
const BabylonViewer = ({
  modelUrl,
  modelUrls = [],
  autoRotate = true,
  onLoaded,
  frameCornerPositions = [], // array of 4 corner positions from frame data
  motorUrl,
  motorMountingPoint = [0, 0, 0], // [x,y,z] offset from motor origin to mounting point
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

  // Convert frame corner positions to Vector3 and apply motor mounting point offset
  const computeMotorPositions = (cornerPositions, mountingPoint) => {
    if (!cornerPositions || cornerPositions.length !== 4) return [];
    
    // mountingPoint is the offset from motor origin to its mounting hole
    // We need to subtract this offset so the mounting hole aligns with frame corner
    const offset = new Vector3(-mountingPoint[0], -mountingPoint[1], -mountingPoint[2]);
    
    return cornerPositions.map(corner => {
      const framePos = new Vector3(corner[0], corner[1], corner[2]);
      return framePos.add(offset);
    });
  };

  // Infer unit scale factor to convert mm positions to scene units based on frame size
  const inferUnitScale = (scene, frameCorners) => {
    try {
      if (!scene || !frameCorners || frameCorners.length !== 4) return 1;
      const frameMeshes = scene.meshes.filter(m => m.metadata?.componentType === 'frame' && !m.name.startsWith('__') && m.getBoundingInfo);
      if (!frameMeshes.length) return 1;
      // Compute scene-space bounding diagonal for frame
      let minVec = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
      let maxVec = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
      frameMeshes.forEach(m => {
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
      const sceneDiag = Math.sqrt(sizeVec.x*sizeVec.x + sizeVec.y*sizeVec.y + sizeVec.z*sizeVec.z);
      // Compute expected mm diagonal using opposite corners [0] and [2]
      const a = frameCorners[0];
      const c = frameCorners[2];
      const dx = c[0] - a[0];
      const dy = c[1] - a[1];
      const dz = c[2] - a[2];
      const mmDiag = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (mmDiag <= 0 || !isFinite(sceneDiag) || sceneDiag <= 0) return 1;
      const scale = sceneDiag / mmDiag; // scene units per mm
      // Log and clamp to reasonable range
      if (scale < 1e-4 || scale > 1e4 || !isFinite(scale)) return 1;
      console.log(`[BabylonViewer] Inferred unit scale (scene/mm): ${scale.toFixed(6)} (sceneDiag=${sceneDiag.toFixed(4)}, mmDiag=${mmDiag.toFixed(2)})`);
      return scale;
    } catch (e) {
      console.warn('[BabylonViewer] Failed to infer unit scale:', e);
      return 1;
    }
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

    // 4. adjust limit dynamically
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

    // Clear previous non-system meshes only when URLs actually change
    // Track individual component URLs to avoid clearing everything when only positioning changes
    const currentUrls = {
      motorUrl,
      batteryUrl,
      fcUrl,
      escUrl,
      receiverUrl,
      propellerUrl,
      frameUrl: modelUrls[0] || null
    };
    
    const previousUrls = previousUrlsRef.current || {};
    
    // Force dispose if resetKey changed explicitly
    const resetTriggered = resetKey !== (scene.__lastResetKey || 0);
    if (resetTriggered) {
      scene.__lastResetKey = resetKey;
    }

    // Only dispose meshes for components whose URLs actually change
    if (resetTriggered) {
      const meshesToDispose = scene.meshes.filter(m => !m.name.startsWith("__"));
      meshesToDispose.forEach(m => m.dispose());
    } else {
      // Selective disposal based on which URLs changed
      Object.keys(currentUrls).forEach(key => {
        if (currentUrls[key] !== previousUrls[key]) {
          console.log(`[BabylonViewer] URL changed for ${key}: ${previousUrls[key]} -> ${currentUrls[key]}`);
          // Map key to a normalized component type
          const keyToType = {
            motorUrl: 'motor',
            batteryUrl: 'battery',
            fcUrl: 'flight_controller',
            escUrl: 'esc',
            receiverUrl: 'receiver',
            propellerUrl: 'propeller',
            frameUrl: 'frame'
          };
          const componentType = keyToType[key] || key.replace('Url','');

          // Dispose meshes tagged with this component type; fallback to name heuristic
          scene.meshes.forEach(m => {
            const tagged = m.metadata?.componentType === componentType;
            const byName = m.name.toLowerCase().includes(componentType) || m.name.startsWith(`${componentType}_`);
            if (!m.name.startsWith("__") && (tagged || byName)) {
              console.log(`[BabylonViewer] Disposing ${m.name} due to ${key} change`);
              m.dispose();
            }
          });
          // Also dispose transform roots for this component type
          (scene.transformNodes || []).forEach(n => {
            if (n.metadata?.componentType === componentType) {
              console.log(`[BabylonViewer] Disposing transform root ${n.name} for ${componentType}`);
              n.dispose();
            }
          });
        }
      });
    }
    
    previousUrlsRef.current = currentUrls;
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

    // Normalize URL to ensure Babylon.js recognizes it as GLB
    // Replace .step/.stp/.sldprt extensions with .glb in the URL for Babylon.js
    const normalizeModelUrl = (url) => {
      if (!url) return url;
      // Replace file extensions that Babylon.js might misinterpret
      return url.replace(/\.(step|stp|sldprt)(\?|$)/gi, '.glb$2');
    };

    const loadSingle = async (url, cb, componentType) => {
      if (!url) return;
      const ok = await preflight(url);
      if (!ok) return;
      pendingLoadsRef.current += 1;
      // Normalize URL so Babylon.js recognizes it as GLB
      const normalizedUrl = normalizeModelUrl(url);
      SceneLoader.ImportMeshAsync(null, "", normalizedUrl, scene)
        .then((result) => {
          // result.meshes contains ONLY meshes imported for this URL
          const newMeshes = result.meshes.filter(m => !m.name.startsWith("__"));

          newMeshes.forEach(m => {
            m.metadata = { ...(m.metadata || {}), autoSpin: true, sourceUrl: url };
            if (componentType) m.metadata.componentType = componentType;
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
        })
        .catch((e) => {
          console.error("Failed to load model:", normalizedUrl, "(original:", url, ")", e);
          markStatus(url, 'error', (e && e.message) || 'Load failed');
        })
        .finally(() => {
          pendingLoadsRef.current -= 1;
          if (pendingLoadsRef.current === 0) {
            // scheduleNormalization();
          }
        });
    };

    // Load non-motor components first (centered)
    dynamicUrls.forEach(url => {
      const compType = (url === currentUrls.frameUrl) ? 'frame' : undefined;
      loadSingle(url, null, compType);
    });

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

    // Load motors at frame corner positions with mounting point alignment
    const motorPositions = computeMotorPositions(frameCornerPositions, motorMountingPoint);
    console.log('[BabylonViewer] Motor positions computed:', motorPositions.map(p => `(${p.x}, ${p.y}, ${p.z})`));
    console.log('[BabylonViewer] Frame corners:', frameCornerPositions);
    console.log('[BabylonViewer] Mounting point:', motorMountingPoint);
    console.log('[BabylonViewer] motorUrl:', motorUrl);
    console.log('[BabylonViewer] Will load motors?', motorUrl && motorPositions.length === 4);
    if (motorUrl && motorPositions.length === 4) {
      loadSingle(motorUrl, (loadedMeshes) => {
        const meshesToUse = loadedMeshes.filter(m => !m.name.startsWith("__"));
        console.log('[BabylonViewer] Motor meshes loaded:', meshesToUse.length);
        if (meshesToUse.length === 0) return;

        // Determine unit scale between mm (corner data) and scene units (GLB)
        const unitScale = inferUnitScale(scene, frameCornerPositions);
        const scaledPositions = motorPositions.map(p => p.scale(unitScale));

        // Create a TransformNode per motor instance and parent all meshes to it
        const createMotorInstance = (idx, position) => {
          const root = new TransformNode(`motor_${idx}_root`, scene);
          root.position = position.clone();
          root.metadata = { componentType: 'motor' };

          meshesToUse.forEach((mesh) => {
            const inst = idx === 0 ? mesh : mesh.clone(`motor_${idx}_${mesh.name}`);
            if (!inst) {
              console.error(`[BabylonViewer] Failed to instantiate motor ${idx} from ${mesh.name}`);
              return;
            }
            inst.parent = root;
            inst.metadata = { ...(inst.metadata || {}), componentType: 'motor' };
            if (idx > 0) {
              console.log(`[BabylonViewer] Cloned motor ${idx} mesh: ${inst.name}`);
            }
          });

          return root;
        };

        // First instance uses original meshes
        const firstRoot = createMotorInstance(0, scaledPositions[0]);
        console.log('[BabylonViewer] Positioned first motor at:', firstRoot.position);

        // Remaining instances clone meshes under separate roots
        for (let i = 1; i < scaledPositions.length; i++) {
          createMotorInstance(i, scaledPositions[i]);
        }

        setTimeout(() => {
          const allMotorRoots = (scene.transformNodes || []).filter(n => n.name.includes('motor_') && n.metadata?.componentType === 'motor');
          console.log(`[BabylonViewer] Total motor roots in scene: ${allMotorRoots.length}`);
          allMotorRoots.forEach(n => {
            console.log(`  - ${n.name} at (${n.position.x.toFixed(2)}, ${n.position.y.toFixed(2)}, ${n.position.z.toFixed(2)})`);
          });
        }, 400);
      }, 'motor');
    }

    // Load propellers: clone to four corners, positioned above motors (or frame corners if motors absent)
    if (propellerUrl && frameCornerPositions.length === 4) {
      loadSingle(propellerUrl, (loadedMeshes) => {
        const meshesToUse = loadedMeshes.filter(m => !m.name.startsWith("__"));
        if (meshesToUse.length === 0) return;

        // Infer unit scale and compute base positions
        const unitScale = inferUnitScale(scene, frameCornerPositions);
        const motorRoots = (scene.transformNodes || []).filter(n => n.metadata?.componentType === 'motor')
                             .sort((a,b) => a.name.localeCompare(b.name));

        const propLiftMm = 6; // ~6mm above motor origin as a safe default
        const lift = unitScale * propLiftMm;

        let propPositions;
        if (motorRoots.length >= 4) {
          propPositions = motorRoots.slice(0,4).map(r => new Vector3(r.position.x, r.position.y + lift, r.position.z));
        } else {
          // Fallback to frame corners (scaled) if motors not present
          propPositions = frameCornerPositions.map(c => new Vector3(c[0]*unitScale, c[1]*unitScale + lift, c[2]*unitScale));
        }

        const createPropInstance = (idx, position) => {
          const root = new TransformNode(`prop_${idx}_root`, scene);
          root.position = position.clone();
          root.metadata = { componentType: 'propeller' };
          meshesToUse.forEach((mesh) => {
            const inst = idx === 0 ? mesh : mesh.clone(`prop_${idx}_${mesh.name}`);
            if (!inst) return;
            inst.parent = root;
            inst.metadata = { ...(inst.metadata || {}), componentType: 'propeller' };
          });
          return root;
        };

        const firstRoot = createPropInstance(0, propPositions[0]);
        for (let i = 1; i < 4; i++) {
          createPropInstance(i, propPositions[i]);
        }
      }, 'propeller');
    }

  }, [modelUrl, modelUrls, frameCornerPositions, motorUrl, motorMountingPoint, batteryUrl, fcUrl, escUrl, receiverUrl, propellerUrl, onLoaded, groundClearance, resetKey, clearedComponents]);

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
