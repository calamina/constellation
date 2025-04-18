import * as THREE from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from "gsap";

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0xffffff, 0)
document.body.appendChild(renderer.domElement)

// CAMERA & CONTROLS
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight
)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false
controls.enableZoom = false
controls.enableRotate = false
// camera.position.set(10, 5, 10)
camera.position.set(20, 0, 0)
camera.lookAt(0, 0, 0)
controls.update()

// SCENE
const scene = new THREE.Scene()

window.addEventListener("resize", onWindowResize)
document.querySelector("#next")?.addEventListener("click", next)
document.querySelector("#previous")?.addEventListener("click", previous)

// STARS
const star1 = new THREE.Group()
const star2 = new THREE.Group()
const star3 = new THREE.Group()
scene.add(star1, star2, star3)
let starState: starGroup = { front: star1, left: star2, right: star3 }

// FOG
scene.fog = new THREE.Fog(0xdddddd, 0, 28);


// ANIMATE
function animate() {
  renderer.render(scene, camera)

  star1?.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.sin(Date.now() / 3000) * 0.005)
  star1?.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.sin(Date.now() / 3000) * 0.01)
  star1?.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.sin(Date.now() / 4500) * 0.015)

  star2?.children[1]?.rotateOnAxis(new THREE.Vector3(1.0, 0, 0), Math.sin(Date.now() / 3000) * 0.005)
  star2?.children[1]?.rotateOnAxis(new THREE.Vector3(0, 1.0, 0), Math.sin(Date.now() / 3000) * 0.005)
  star2?.children[1]?.rotateOnAxis(new THREE.Vector3(0, 0, 1.0), Math.sin(Date.now() / 3000) * 0.005)
  star2?.children[2]?.rotateOnAxis(new THREE.Vector3(0.6, 0, 0), Math.sin(Date.now() / 3000) * 0.005)
  star2?.children[2]?.rotateOnAxis(new THREE.Vector3(0, 0.6, 0), Math.sin(Date.now() / 3000) * 0.005)
  star2?.children[2]?.rotateOnAxis(new THREE.Vector3(0, 0, 0.6), Math.sin(Date.now() / 3000) * 0.005)
  star2?.children[3]?.rotateOnAxis(new THREE.Vector3(0.3, 0, 0), Math.sin(Date.now() / 3000) * 0.005)
  star2?.children[3]?.rotateOnAxis(new THREE.Vector3(0, 0.3, 0), Math.sin(Date.now() / 3000) * 0.005)
  star2?.children[3]?.rotateOnAxis(new THREE.Vector3(0, 0, 0.3), Math.sin(Date.now() / 3000) * 0.005)

  star3?.children[1]?.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.sin(Date.now() / 3000) * 0.005)
  star3?.children[1]?.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.sin(Date.now() / 3000) * 0.03)
  star3?.children[1]?.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.sin(Date.now() / 4500) * 0.015)
  star3?.children[2]?.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.sin(Date.now() / 4500) * 0.015)
  star3?.children[2]?.rotateOnAxis(new THREE.Vector3(0, 0, -1), Math.sin(Date.now() / 3500) * 0.02)
  star3?.children[2]?.rotateOnAxis(new THREE.Vector3(0, -1, 0), Math.sin(Date.now() / 3000) * 0.005)

  requestAnimationFrame(animate)
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

function setupLights() {
  const light3 = new THREE.AmbientLight(0xdddddd, 4)
  scene.add(light3)
}

function createStar1() {
  const sphere = makeSphere(2, '#000000')
  // const insideDemiSphere = makeDemiSphere(4.5, '#000000')
  const insideDemiSphere = makeDemiSphere(4.5, '#dddddd')
  // const insideDemiSphere = makeDemiSphere(4.5, '#dddddd')
  const outsideDemiSphere = makeDemiSphere(5, '#000000')
  const ring = makeRing(4.5, 5)

  star1.add(sphere, insideDemiSphere, outsideDemiSphere, ring)
}

function createStar2() {
  const sphere = makeSphere(2, '#000000')
  const ring1 = makeRing(2.5, 3)
  const ring2 = makeRing(3.2, 4)
  const ring3 = makeRing(4.2, 6)
  star2.add(sphere, ring1, ring2, ring3)
}

function createStar3() {
  const sphere = makeSphere(2, '#000000')

  const ring = makeTorus(4, 0.05, '#000000', '#dddddd')
  const satellite = makeSphere(0.5, '#000000', [0, 4, 0])
  ring.add(satellite)

  const ring2 = makeTorus(6, 0.05, '#000000', '#dddddd')
  const satellite2 = makeSphere(0.3, '#000000', [0, 6, 0])
  ring2.add(satellite2)

  star3.add(sphere, ring, ring2)
}

// function createStar3() {
//   const sphere = makeSphere(2, '#000000')

//   const ring = makeRing(4, 4.2, '#000000', '#dddddd')
//   const satellite = makeSphere(0.5, '#000000', [0,4,0]) 
//   ring.add(satellite)

//   const ring2 = makeRing(6, 6.2, '#000000', '#dddddd')
//   const satellite2 = makeSphere(0.3, '#000000', [0,6,0])  
//   ring2.add(satellite2)

//   star3.add(sphere, ring, ring2)
// }

function makeRing(innerRadius: number, outerRadius: number) {
  const ring = new THREE.Group()
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 32, 32)
  const material = new THREE.MeshLambertMaterial({ color: "#000000", side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(geometry, material)
  ring.add(mesh)
  ring.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
  return ring
}
// function makeRing(innerRadius: number, outerRadius: number, color: string, borderColor: string) {
//   const ring = new THREE.Group()
//   const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 32, 32)
//   const material = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide })
//   const mesh = new THREE.Mesh(geometry, material)
//   const wireMaterial = new THREE.LineBasicMaterial({ color: borderColor })
//   const wireGeometry = new THREE.EdgesGeometry(geometry)
//   const wire = new THREE.LineSegments(wireGeometry, wireMaterial)
//   ring.add(mesh, wire)
//   ring.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
//   return ring
// }

function makeTorus(innerRadius: number, thickness: number, color: string, _borderColor: string) {
  const ring = new THREE.Group()
  const geometry = new THREE.TorusGeometry(innerRadius, thickness, 32, 32)
  const material = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(geometry, material)
  ring.add(mesh)
  ring.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
  return ring
}

function makeSphere(radius: number, color: string, position?: [number, number, number]) {
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32)
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: color })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  if (position) {
    sphere.position.set(...position)
  }
  return sphere
}

function makeDemiSphere(radius: number, color: string) {
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI)
  return sphere
}

function next() {
  starState = { front: starState.right, left: starState.front, right: starState.left }
  moveStars(starState)
}

function previous() {
  starState = { front: starState.left, left: starState.right, right: starState.front }
  moveStars(starState)
}

interface starGroup {
  front: THREE.Group<THREE.Object3DEventMap>;
  left: THREE.Group<THREE.Object3DEventMap>;
  right: THREE.Group<THREE.Object3DEventMap>;
}

function moveStars(group: starGroup) {
  gsap.to(group.front.position, {
    x: 12, y: 0, z: 0,
    ease: "power3.inOut",
    duration: 0.3
  });
  gsap.to(group.left.position, {
    x: 0, y: 0, z: 10,
    ease: "power3.inOut",
    duration: 0.3
  });
  gsap.to(group.right.position, {
    x: 0, y: 0, z: -10,
    ease: "power3.inOut",
    duration: 0.3
  })
}

// INIT
createStar1()
star1.position.set(12, 0, 0)
star1.scale.set(.2, .2, .2)

createStar2()
star2.position.set(0, 0, 10)
star2.scale.set(.2, .2, .2)

createStar3()
star3.position.set(0, 0, -10)
star3.scale.set(.2, .2, .2)

setupLights()
animate()
