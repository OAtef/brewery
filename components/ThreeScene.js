// components/ThreeScene.js
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      85, // field of view
      window.innerWidth / window.innerHeight, // aspect ratio
      0.1, // near clipping
      1000 // far clipping
    );

    // Move the camera back to "zoom out"
    camera.position.set(0, 5, 6); // increase Z to zoom out more
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    currentMount.appendChild(renderer.domElement);

    // Add light so we can see the model
    const ambientLight = new THREE.AmbientLight(0xffffff, 4);
    scene.add(ambientLight);
    scene.background = new THREE.Color(0x87ceeb); // SkyBlue

    // Create video texture

    const video = document.createElement("video");
    video.src = "/bamoot.mp4"; // local file, no CORS issue
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.load();
    document.addEventListener("click", () => {
      video.muted = false;
      video.play();
    });

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    videoTexture.center.set(0.5, 0.5); // rotate around center
    videoTexture.rotation = Math.PI / 2; // 90 degrees in radians

    const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      "/cornercafe.glb", // path to your GLTF model
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (
            child.isMesh &&
            child.material &&
            child.material.name === "Material.001"
          ) {
            child.material = videoMaterial;
          }
        });

        scene.add(model);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          console.log(`Loading: ${percentComplete.toFixed(2)}%`);
        } else {
          console.log(
            `Loading: ${xhr.loaded} bytes loaded (total size unknown)`
          );
        }
      },
      (error) => {
        console.error("An error occurred loading the GLTF model:", error);
      }
    );

    const controls = new OrbitControls(camera, renderer.domElement);

    // LIMIT VERTICAL ROTATION (up/down)
    controls.minPolarAngle = Math.PI / 4; // 45 degrees
    controls.maxPolarAngle = Math.PI / 2; // 90 degrees

    // LIMIT HORIZONTAL ROTATION (left/right)
    controls.minAzimuthAngle = -Math.PI / 4; // -45 degrees
    controls.maxAzimuthAngle = Math.PI / 4; // 45 degrees

    // Optional extras
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.target.set(0, 3, 1); // e.g., for a model centered at y = 2
    function animate() {
      requestAnimationFrame(animate);

      controls.update(); // required for damping or animations

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
}
