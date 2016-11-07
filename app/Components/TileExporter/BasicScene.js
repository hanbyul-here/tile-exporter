import THREE from 'three';
import OrbitControls from '../../libs/OrbitControl';
import '../../libs/Triangulation';
// Changes the way Threejs does triangulation
THREE.Triangulation.setLibrary('earcut');

class BasicScene {

  constructor() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Global : renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);

    // Global : scene
    this.scene = new THREE.Scene();

    // Global : camera
    this.camera = new THREE.PerspectiveCamera(20, w / h, 1, 1000000);
    this.camera.position.set(0, 0, 500);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // orbit control
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = false;

    // direct light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    light.rotation.set(2, 1, 1);
    this.scene.add(light);

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(ambientLight);

    // attach renderer to DOM
    document.body.appendChild(this.renderer.domElement);
    // initiating animate of rendere at the same time
    this.animate();
  }

  get getScene() {
    return this.scene;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addObject(obj) {
    this.scene.add(obj);
  }

  removeObject(objName) {
    const selectedObj = this.scene.getObjectByName(objName);
    if (selectedObj) this.scene.remove(selectedObj);
  }
}

export default BasicScene;
