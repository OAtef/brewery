import Head from "next/head";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Container, Box, Typography, Grid, IconButton } from "@mui/material";

const HomePage = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    let modelReady = false;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      85,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 4);
    scene.add(ambientLight);
    scene.background = new THREE.Color(0xf9f3e5);

    // Video Texture
    const video = document.createElement("video");
    fetch("/videos.txt")
      .then((response) => response.text())
      .then((text) => {
        const videoSources = text.trim().split("\n");
        const randomVideoSource =
          videoSources[Math.floor(Math.random() * videoSources.length)];
        video.src = randomVideoSource;
      });
    video.autoplay = true;
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
    videoTexture.center.set(0.5, 0.5);
    videoTexture.rotation = Math.PI / 2;

    const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    // Loading Spinner
    const loadingSpinner = document.createElement("div");
    loadingSpinner.style.position = "absolute";
    loadingSpinner.style.top = "50%";
    loadingSpinner.style.left = "50%";
    loadingSpinner.style.width = "50px";
    loadingSpinner.style.height = "50px";
    loadingSpinner.style.border = "5px solid rgba(0, 0, 0, 0.1)";
    loadingSpinner.style.borderRadius = "50%";
    loadingSpinner.style.borderTopColor = "#000";
    loadingSpinner.style.animation = "spin 1s ease-in-out infinite";
    currentMount.appendChild(loadingSpinner);

    const keyframes = `
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);

    // GLTF Loader
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      "/NewPlaceWithLogo-opt2.glb",
      (gltf) => {
        const model = gltf.scene;
        model.rotation.y = -Math.PI / 1.6;
        model.traverse((child) => {
          if (
            child.isMesh &&
            child.material &&
            child.material.name === "Material.002"
          ) {
            child.material = videoMaterial;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const lookAtPoint = new THREE.Vector3(
          center.x,
          center.y - size.y / 2.5,
          center.z
        );
        controls.target.copy(lookAtPoint);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraDistance = maxDim / (2 * Math.tan(fov / 2));

        camera.position.set(
          center.x - cameraDistance / 1.2,
          center.y - size.y / 5,
          center.z + cameraDistance / 2.5
        );
        camera.lookAt(lookAtPoint);
        camera.rotation.y = THREE.MathUtils.degToRad(10);

        controls.update();
        scene.add(model);
        modelReady = true;
      },
      undefined,
      (error) => {
        console.error("An error occurred loading the GLTF model:", error);
        loadingSpinner.style.display = "none";
      }
    );

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      if (modelReady) {
        loadingSpinner.style.display = "none";
        modelReady = false;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <Head>
        <title>The Brewery</title>
        <link rel="icon" href="/logo.png" />
        <style>{`
          @font-face {
            font-family: 'Stinger';
            src: url('/stinger/StingerTrial-Regular.ttf') format('truetype');
          }
          body {
            background-color: #F9F3e5;
            background-image: url('/background_lower.png');
            background-repeat: repeat;
            background-size: 400px 200px;
          }
        `}</style>
      </Head>
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            backgroundColor: "#F9F3e5",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <img
            src="/logo.png"
            alt="The Brewery Logo"
            style={{ maxWidth: "100%", height: "auto", maxHeight: "170px" }}
          />
        </Box>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{
            mt: 4,
            backgroundColor: "#F9F3e5",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "8px",
          }}
        >
          <Grid
            item
            style={{ borderRadius: "8px" }}
            onClick={() =>
              window.open(
                "https://www.facebook.com/people/The-Brewery/61579416881941/",
                "_blank"
              )
            }
          >
            <IconButton href="#">
              <img
                src="/facebooklogo.png"
                alt="Facebook"
                style={{ width: 40, height: 40 }}
              />
            </IconButton>
          </Grid>
          <Grid
            item
            style={{ borderRadius: "8px" }}
            onClick={() =>
              window.open(
                "https://www.instagram.com/thebrewery.coffee/",
                "_blank"
              )
            }
          >
            <IconButton href="#">
              <img
                src="/instgramlogo.png"
                alt="Instagram"
                style={{ width: 40, height: 40 }}
              />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton href="#">
              <img
                src="/TalabatLogo.png"
                alt="Talabat"
                style={{ width: 40, height: 40 }}
              />
            </IconButton>
          </Grid>
        </Grid>
        <Box
          ref={mountRef}
          sx={{
            width: "75%",
            height: "50vh",
            position: "relative",
          }}
        ></Box>
      </Container>
    </>
  );
};

export default HomePage;
