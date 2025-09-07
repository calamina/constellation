import * as THREE from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DOM, COLORS } from "./utils";
import { Star } from "./models";
import gsap from "gsap";

export const space = () => {

  // FPS
  let clock = new THREE.Clock();
  let delta = 0;
  let interval = 1 / 120;

  // SIZE
  let dataWidth = DOM.data?.getBoundingClientRect().width ?? 0
  let dataHeight = DOM.data?.getBoundingClientRect().height ?? 0

  // RENDERER
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(dataWidth / dataHeight)
  renderer.setSize(dataWidth, dataHeight - 2)
  renderer.setClearColor(COLORS.black, 0)
  DOM.data?.appendChild(renderer.domElement)

  // CAMERA & RAYCASTER
  const camera = new THREE.PerspectiveCamera(
    50, //FOV
    dataWidth / dataHeight
  )
  camera.position.set(Math.PI + 0.86, 0, 0) // PI so there are decimals displayed for x coord
  camera.lookAt(0, 0, 0)

  // RAYCASTER
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster
  raycaster.setFromCamera(pointer, camera);

  // SCENE
  const scene = new THREE.Scene()

  // CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  controls.enablePan = false
  let isInteractingControls = false

  // STARS
  const star1 = new THREE.Group()
  const star2 = new THREE.Group()
  const star3 = new THREE.Group()

  // EVENTS
  window.addEventListener("resize", onWindowResize)
  controls.addEventListener("start", () => isInteractingControls = true)
  controls.addEventListener("end", () => setTimeout(() => isInteractingControls = false, 1000))

  function rotateStar1() {
    star1.rotateX(Math.sin(Date.now() / 3000) * 0.005)
    star1.rotateY(Math.sin(Date.now() / 3000) * 0.01)
    star1.rotateZ(Math.sin(Date.now() / 4500) * 0.015)
  }

  function rotateStar2() {
    const [ring1, ring2, ring3] = star2.children
    const rotation = Math.sin(Date.now() / 3000) * 0.01

    ring1.rotateX(rotation)
    ring1.rotateY(rotation)
    ring1.rotateZ(rotation)

    ring2.rotateX(rotation * 0.8)
    ring2.rotateY(rotation * 0.8)
    ring2.rotateZ(rotation * 0.8)

    ring3.rotateX(rotation * 0.6)
    ring3.rotateY(rotation * 0.6)
    ring3.rotateZ(rotation * 0.6)
  }

  function rotateStar3() {
    const [ring1, ring2] = star3.children

    ring1.rotateX(Math.sin(Date.now() / 3000) * 0.005)
    ring1.rotateY(Math.sin(Date.now() / 4500) * 0.015)
    ring1.rotateZ(Math.sin(Date.now() / 3000) * 0.03)
    ring2.rotateX(- Math.sin(Date.now() / 4500) * 0.015)
    ring2.rotateY(- Math.sin(Date.now() / 3000) * 0.005)
    ring2.rotateZ(- Math.sin(Date.now() / 3500) * 0.02)
  }

  function onWindowResize() {
    dataWidth = DOM.data?.getBoundingClientRect().width ?? 0
    dataHeight = DOM.data?.getBoundingClientRect().height ?? 0
    renderer.setSize(dataWidth, dataHeight - 2)
    renderer.setPixelRatio(dataWidth / dataHeight)
    camera.aspect = (dataWidth / dataHeight)
    camera.updateProjectionMatrix()
  }

  function createCore(): THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap> {
    const sphere = makeSphere(0.24, COLORS.black)
    sphere.material.transparent = true
    scene.add(sphere)
    return sphere
  }

  function createStar1() {
    const outsideDemiSphere = makeDemiSphere(0.8, COLORS.black)
    const ring = makeRing(0.725, 0.8)
    star1.add(outsideDemiSphere, ring)
  }

  function createStar2() {
    const ring1 = makeRing(0.32, 0.4)
    const ring2 = makeRing(0.45, 0.55)
    const ring3 = makeRing(0.6, 0.8)
    star2.add(ring1, ring2, ring3)
  }

  function createStar3() {
    const ring = makeTorus(0.8, 0.002, COLORS.black)
    const satellite = makeSphere(0.05, COLORS.black, [0, 0.8, 0])
    ring.add(satellite)

    const ring2 = makeTorus(0.6, 0.002, COLORS.black)
    const satellite2 = makeSphere(0.075, COLORS.black, [0, 0.6, 0])
    ring2.add(satellite2)

    star3.add(ring, ring2)
  }

  function makeRing(innerRadius: number, outerRadius: number) {
    const ring = new THREE.Group()
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 64)
    const material = new THREE.MeshLambertMaterial({ color: COLORS.black, side: THREE.DoubleSide })
    material.transparent = true
    const mesh = new THREE.Mesh(geometry, material)
    ring.add(mesh)
    ring.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
    return ring
  }

  function makeTorus(innerRadius: number, thickness: number, color: string) {
    const ring = new THREE.Group()
    const geometry = new THREE.TorusGeometry(innerRadius, thickness, 64, 64)
    const material = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geometry, material)
    ring.add(mesh)
    ring.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
    return ring
  }

  function makeSphere(radius: number, color: string, position?: [number, number, number]) {
    const sphereGeometry = new THREE.SphereGeometry(radius, 64, 64)
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: color })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    if (position) {
      sphere.position.set(...position)
    }
    return sphere
  }

  function makeDemiSphere(radius: number, color: string) {
    const sphereGeometry = new THREE.SphereGeometry(radius, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2)
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: color })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI)
    return sphere
  }

  function getPointer(e: MouseEvent) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1.01;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 0.85;
    raycaster.setFromCamera(pointer, camera);
  }

  function swingFrontStar(star: Star) {
    const rotation = star.model.rotation
    gsap.to(rotation, {
      x: rotation.x + (Math.PI / ((Math.random() + 0.3) * 3)),
      y: rotation.y + (Math.PI / ((Math.random() + 0.3) * 3)),
      z: rotation.z + (Math.PI / ((Math.random() + 0.3) * 3)),
      duration: 1,
      ease: "power2.out"
    })
  }

  function raycastClick(e: MouseEvent, object: THREE.Mesh, fn: () => void) {
    getPointer(e)
    const intersects = raycaster.intersectObjects([object]);
    intersects.forEach((_e: any) => fn())
  }

  function raycastHover(e: MouseEvent, object: THREE.Mesh, mouseIn: () => void, mouseOut: () => void) {
    getPointer(e)
    const intersects = raycaster.intersectObjects([object]);
    if (intersects.length) {
      mouseIn()
    }
    else if (!intersects || intersects.length === 0) {
      mouseOut()
    }
  }

  // ANIMATE
  function animate(update: () => void) {
    update()
    requestAnimationFrame(() => animate(update))
    controls.update();
    delta += clock.getDelta();
    if (delta > interval) {
      renderer.render(scene, camera)
      delta = delta % interval;
    }
  }

  function slowRotate(star: Star) {
    star.model.rotation.y += 0.001
    star.model.rotation.z += 0.001
  }

  function replaceStar(current: Star, next: Star, effect: () => void) {
    scene.remove(current.model)
    scene.add(next.model)
    effect()
  }

  function getCameraPosition(): number[] {
    return [camera.position.x, camera.position.y, camera.position.z]
  }

  function isCoreActive(): boolean {
    return core?.material?.opacity === 1
  }

  function setCoreOpacity(opacity: number) {
    core.material.opacity = opacity
  }

  const stars: Star[] = [
    {
      model: star1,
      rotate: rotateStar1,
    },
    {
      model: star2,
      rotate: rotateStar2,
    },
    {
      model: star3,
      rotate: rotateStar3,
    }
  ]

  // INIT
  const core = createCore()
  createStar1()
  createStar2()
  createStar3()
  scene.add(star1)

  return {
    core,
    stars,
    swingFrontStar,
    animate,
    slowRotate,
    replaceStar,
    raycastClick,
    raycastHover,
    getCameraPosition,
    setCoreOpacity,
    isInteractingControls,
    isCoreActive,
  }
}