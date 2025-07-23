import * as THREE from "three"
import { gsap } from "gsap";

interface starGroup {
  front: THREE.Group<THREE.Object3DEventMap>;
  left: THREE.Group<THREE.Object3DEventMap>;
  right: THREE.Group<THREE.Object3DEventMap>;
}

type StarName = 'star1' | 'star2' | 'star3'

const data = {
  star1: {
    index: 1,
    name: "Astra Nebula",
    scientific: "Globanthea-02C",
    galaxy: "Canthora Twin Galaxy",
    distance: "215.003 UVs",
    type: "Gas Giant",
    inhab: "Non-inhabitable",
  },
  star2: {
    index: 3,
    name: "Anantha ",
    scientific: "Socialedes-665-2",
    galaxy: "Pontelius Major",
    distance: "3.5e10 UVs",
    type: "Pulsar Planet",
    inhab: "Non-inhabitable",
  },
  star3: {
    index: 2,
    name: "Pangùr Ban",
    scientific: "Erastreïdes-1X",
    galaxy: "Potar Nebulae",
    distance: "1.29e14 UVs",
    type: "Silicate Planet",
    inhab: "???",
  }
}

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0xffffff, 0)
document.body.appendChild(renderer.domElement)

// CAMERA & RAYCASTER
const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight
)
const raycaster = new THREE.Raycaster
const pointer = new THREE.Vector2();

camera.position.set(20, 0.25, 0)
camera.lookAt(0, 0, 0)
raycaster.setFromCamera(pointer, camera);

// SCENE
const scene = new THREE.Scene()

// STARS
const star1 = new THREE.Group()
star1.name = "star1"
const star2 = new THREE.Group()
star2.name = "star2"
const star3 = new THREE.Group()
star3.name = "star3"
const star4 = new THREE.Group()
star4.name = "star4"
let starState: starGroup = { front: star1, left: star2, right: star3 }

// EVENTS
window.addEventListener('click', raycast);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener("resize", onWindowResize)
document.querySelector("#next")?.addEventListener("click", next)
document.querySelector("#previous")?.addEventListener("click", previous)


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

function onPointerMove(event: MouseEvent) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

function createCore() {
  const sphere = makeSphere(2, '#000000')
  sphere.name = "core"
  sphere.scale.set(.2, .2, .2)
  sphere.position.set(12, 0.25, 0)
  scene.add(sphere)
}

function createStar1() {
  const outsideDemiSphere = makeDemiSphere(5, '#000000')
  const ring = makeRing(4.5, 5)
  star1.add(outsideDemiSphere, ring)
  star1.scale.set(.2, .2, .2)
  star1.position.set(12, 0.25, 0)
}

function createStar2() {
  const ring1 = makeRing(2.5, 3)
  const ring2 = makeRing(3.2, 4)
  const ring3 = makeRing(4.2, 6)
  star2.add(ring1, ring2, ring3)
  star2.scale.set(.2, .2, .2)
  star2.position.set(12, 0.25, 0)
}

function createStar3() {
  const ring = makeTorus(4, 0.02, '#000000')
  const satellite = makeSphere(0.5, '#000000', [0, 4, 0])
  ring.add(satellite)

  const ring2 = makeTorus(6, 0.02, '#000000')
  const satellite2 = makeSphere(0.3, '#000000', [0, 6, 0])
  ring2.add(satellite2)

  star3.add(ring, ring2)
  star3.scale.set(.2, .2, .2)
  star3.position.set(12, 0.25, 0)
}

function makeRing(innerRadius: number, outerRadius: number) {
  const ring = new THREE.Group()
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 64)
  const material = new THREE.MeshLambertMaterial({ color: "#000000", side: THREE.DoubleSide })
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

function next() {
  starState = { front: starState.right, left: starState.front, right: starState.left }
  setColor()
  moveStars(starState)
  setData(starState.front.name as StarName)
}

function previous() {
  starState = { front: starState.left, left: starState.right, right: starState.front }
  setColor()
  moveStars(starState)
  setData(starState.front.name as StarName)
}

function setData(star: StarName) {
  const active = data[star]
  const titleElements = Array.from(document.querySelector('.main')?.children ?? [])
  const infoElements = Array.from(document.querySelector('.type')?.children ?? [])
  const [name, scientific, galaxy] = titleElements
  const [distance, type, inhab] = infoElements
  const index = document.querySelector('#index')

  if (index) index.innerHTML = active.index.toString()

  name.innerHTML = active.name
  scientific.innerHTML = active.scientific
  galaxy.innerHTML = active.galaxy
  distance.innerHTML = active.distance
  type.innerHTML = active.type
  inhab.innerHTML = active.inhab

  const topos = Array.from(document.querySelector('.topology')?.children ?? [])
  topos.forEach(el => el.classList.add('topohidden'))
  topos[active.index - 1].classList.remove('topohidden')
}

function setColor() {
  var r: HTMLElement | null = document.querySelector(':root');
  if (starState.front === star1) {
    r?.style.setProperty('--color', '#ff000099');
  } else if (starState.front === star2) {
    r?.style.setProperty('--color', '#0000ff77');
  } else {
    r?.style.setProperty('--color', '#00ff0055');
  }
}

function moveStars(group: starGroup) {
  const tl: GSAPTimeline = gsap.timeline({ defaults: { duration: 0.3, ease: "power3.inOut" } })
  tl.to([group.left.position, group.right.position, group.front.position], {
    x: -30,
    y: 0.25,
    onComplete: () => {
      scene.remove(group.left)
      scene.remove(group.right)
      scene.add(group.front)
    }
  })
    .to([group.left.position, group.right.position, group.front.position], {
      x: 12,
      y: 0.25,
    }, 0.15)
}

function updateCoords() {
  const elements = document.querySelectorAll('.coord')
  setInterval(
    () => elements?.forEach(e => e.innerHTML = (Math.random() * 999).toString()),
    1000
  );
}

function raycast() {
  raycaster.setFromCamera(pointer, camera);
  const core = scene.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>
  if (!core) return
  const intersects = raycaster.intersectObjects([core]);
  intersects.forEach((_e: any) => {
    console.debug("CORE ACTIVATED!!")
  })
}

// ANIMATE
function animate() {
  renderer.render(scene, camera)
  if (starState.front === star1) {
    rotateStar1()
  } else if (starState.front === star2) {
    rotateStar2()
  } else {
    rotateStar3()
  }
  requestAnimationFrame(animate)
}

// INIT
createCore()
createStar1()
createStar2()
createStar3()
scene.add(star1)

animate()
updateCoords()
