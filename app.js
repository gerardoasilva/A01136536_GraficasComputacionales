// A01136536
// This is Gerardo Silva's work developed individually as a Computer Graphics final assignature using Three.js

// Import three.js library
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.125.1/build/three.module.js";
// Import module to load FBX models assets
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.125.1/examples/jsm/loaders/FBXLoader.js";
// Import module to load models and textures
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.125.1/examples/jsm/loaders/GLTFLoader.js";
// Import module to add mouse actions
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.125.1/examples/jsm/controls/OrbitControls.js";

// Declare global varibles to handle the ball bounce animation at RAF
var ball, multiplier;

// Clarr that contains de project
class LoadProyect {
  // Instance constructor to initialize de scene
  constructor() {
    this._Initialize();
  }

  // Initializer function that sets up the renderer and scene configuration
  _Initialize() {
    // Create instance of Three.js renderer
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    // Add scene to HTML
    document.body.appendChild(this._threejs.domElement);

    // Listener to update scene on resize
    window.addEventListener(
      "resize",
      () => {
        this._OnWindowResize();
      },
      false
    );

    // Camera confguration constants
    const fov = 30,
      aspect = 1920 / 1080,
      near = 1.0,
      far = 1000.0;
    // Create camera instance
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // Set camera position
    this._camera.position.set(30, 15, 200);

    // Create scene instance
    this._scene = new THREE.Scene();

    // Declare light configuration constants
    const distance = 450.0,
      angle = Math.PI / 3.8,
      penumbra = 1.0,
      decay = 1.0;
    // Create spotlights
    let spotLight1, spotLight2, spotLight3, spotLight4;
    spotLight1 = new THREE.SpotLight(
      0xffffff,
      3.0,
      distance,
      angle,
      penumbra,
      decay
    );
    spotLight2 = new THREE.SpotLight(
      0xffffff,
      3.0,
      distance,
      angle,
      penumbra,
      decay
    );
    spotLight3 = new THREE.SpotLight(
      0xffffff,
      3.0,
      distance,
      angle,
      penumbra,
      decay
    );
    spotLight4 = new THREE.SpotLight(
      0xffffff,
      3.0,
      distance,
      angle,
      penumbra,
      decay
    );

    // Enable spotlight shadows
    spotLight1.castShadow = true;
    spotLight2.castShadow = true;
    spotLight3.castShadow = true;
    spotLight4.castShadow = true;

    // Set spotlights' position
    spotLight1.position.set(-120, 150, 210);
    spotLight2.position.set(120, 150, 210);
    spotLight3.position.set(-120, 150, -210);
    spotLight4.position.set(120, 150, -210);

    // Set spotlights' target
    spotLight1.target.position.set(0, 0, 50);
    spotLight2.target.position.set(0, 0, 50);
    spotLight3.target.position.set(0, 0, -50);
    spotLight4.target.position.set(0, 0, -50);

    // Add spotlights to the scene
    this._scene.add(spotLight1);
    this._scene.add(spotLight2);
    this._scene.add(spotLight3);
    this._scene.add(spotLight4);

    // Add spotlight targets to the scene
    this._scene.add(spotLight1.target);
    this._scene.add(spotLight2.target);
    this._scene.add(spotLight3.target);
    this._scene.add(spotLight4.target);

    // Add mouse controls to the scene
    const controls = new OrbitControls(this._camera, this._threejs.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    // Load floor
    this._LoadPlane();

    // Load basketball court
    this._LoadModel();

    // Load basketball player and animation
    this._LoadAnimatedModel();

    // Render scene
    this._RAF();
  }

  // Function that loads the floor plane
  _LoadPlane() {
    // Create plane geometry instance
    var planeGeometry = new THREE.PlaneGeometry(300, 400, 150, 200);
    // Create texture instance for the plane
    var planeTexture = new THREE.TextureLoader().load(
      "./resources/floorTexture.jpg"
    );
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(8, 8);

    // Create material instance with texture
    var planeMaterial = new THREE.MeshLambertMaterial({
      map: planeTexture,
      side: THREE.DoubleSide,
    });

    // Create plane mesh instance with position and shadows enabled
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 1.7;
    // Add geometry to the scene
    this._scene.add(plane);
    this._previousRAF = null;
  }

  // Function that loads the basketball court model
  _LoadModel() {
    // Create loader instance for the FBX model
    const loader = new FBXLoader();
    // Load model, set position and enable shadows
    loader.setPath("./resources/");
    loader.load("BlueCourt.fbx", (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.position.set(0, 1.8, 0);
      fbx.rotation.y = Math.PI / 2;
      fbx.traverse((c) => {
        c.castShadow = true;
        c.receiveShadow = true;
      });
      // Add court model to the scene
      this._scene.add(fbx);
    });
  }

  // Function that loads the player model
  _LoadAnimatedModel() {
    const loader = new FBXLoader();
    loader.setPath("./resources/");
    loader.load("player.fbx", (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.position.set(35, 1.8, 45);
      fbx.traverse((c) => {
        c.castShadow = true;
      });

      // Load player's animation
      const anim = new FBXLoader();
      anim.setPath("./resources/");
      anim.load("dribble.fbx", (anim) => {
        // Add and play animation to the player model
        this._mixer = new THREE.AnimationMixer(fbx);
        const idle = this._mixer.clipAction(anim.animations[0]);
        idle.play();
      });
      // Add player model to the scene
      this._scene.add(fbx);
      // Call function to load ball
      this._LoadBall();
    });
  }

  // Function that loads basketball geometry
  _LoadBall() {
    // Create sphere geometry instance
    var ballGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    // Create ball texture instance
    var ballTexture = new THREE.TextureLoader().load("./resources/ball.png");
    // Create ball material instance
    var ballMaterial = new THREE.MeshLambertMaterial({
      color: 0xff1100,
      map: ballTexture,
    });
    // Create mesh of the ball with position and shadows enabled
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.castShadow = true;
    ball.receiveShadow = true;
    ball.position.set(31.8, 10.75, 53);
    // Add ball to the scene
    this._scene.add(ball);
  }

  // Function that updates window on resize
  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  // Functions that renders the scene
  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      if (ball.position.y <= 3.2) {
        multiplier = 1;
      }
      if (ball.position.y >= 10.75) {
        multiplier = -1;
      }
      ball.position.y += multiplier * 0.545;

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  // Aux function to render the player animation
  _Step(timeElapsed) {
    if (this._mixer) {
      this._mixer.update(timeElapsed * 0.001);
    }
  }
}

// Create app variable
let _APP = null;

// Listener that creates project instance
window.addEventListener("DOMContentLoaded", () => {
  _APP = new LoadProyect();
});
