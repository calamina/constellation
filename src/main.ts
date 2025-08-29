import * as THREE from "three"
import { gsap } from "gsap";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import data from './assets/data.json'
gsap.registerPlugin(ScrambleTextPlugin)

const COLORS = { black: "#000000" }
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

interface starGroup {
  front: THREE.Group<THREE.Object3DEventMap>;
  left: THREE.Group<THREE.Object3DEventMap>;
  right: THREE.Group<THREE.Object3DEventMap>;
}

type StarName = 'star1' | 'star2' | 'star3'

// FPS
let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 120;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 0)
const vx = document.querySelector(".vx")
vx?.appendChild(renderer.domElement)

// CAMERA & RAYCASTER
const camera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight
)
const raycaster = new THREE.Raycaster
const pointer = new THREE.Vector2();

camera.position.set(5, 0, 0)
camera.lookAt(0, 0, 0)
raycaster.setFromCamera(pointer, camera);

// SCENE
const scene = new THREE.Scene()
scene.position.y = 0.25

// STARS
const star1 = new THREE.Group()
star1.name = "star1"
const star2 = new THREE.Group()
star2.name = "star2"
const star3 = new THREE.Group()
star3.name = "star3"
let starState: starGroup = { front: star1, left: star2, right: star3 }

// EVENTS
window.addEventListener('pointerdown', raycast);
window.addEventListener('pointermove', raycastinfo);
window.addEventListener("resize", onWindowResize)
document.querySelector("#next")?.addEventListener("click", next)
document.querySelector("#previous")?.addEventListener("click", previous)
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case "ArrowLeft":
      return previous()
    case "ArrowRight":
      return next()
  }
});

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
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

function createCore() {
  const sphere = makeSphere(0.24, COLORS.black)
  sphere.name = "core"
  sphere.material.transparent = true
  scene.add(sphere)
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

function next() {
  starState = { front: starState.right, left: starState.front, right: starState.left }
  updateStars("next")
}

function previous() {
  starState = { front: starState.left, left: starState.right, right: starState.front }
  updateStars("prev")
}

function updateStars(direction: "prev" | "next") {
  moveStars(direction)
  setColor()
  setData(starState.front.name as StarName)
}

function setData(star: StarName) {
  const active = data[star]
  const titleElements = Array.from(document.querySelector('.main')?.children ?? [])
  const infoElements = Array.from(document.querySelector('.type')?.children ?? [])
  const [name, scientific, galaxy] = titleElements
  const [distance, type, inhab] = infoElements
  const index = document.querySelector('#index')
  const units = document.querySelectorAll('.unit') ?? []

  const tl = gsap.timeline({ defaults: { duration: 0.3, scrambleText: { text: "", tweenLength: false, chars: "lowerCase" } } })

  tl.call(() => { index!.innerHTML = active.index.toString() })
  tl.to(name, { scrambleText: { text: active.name, }, }, 0)
  tl.to(scientific, { scrambleText: { text: active.scientific, }, }, 0)
  tl.to(galaxy, { scrambleText: { text: active.galaxy, }, }, 0)
  tl.to(distance, { scrambleText: { text: active.distance, }, }, 0)
  tl.to(type, { scrambleText: { text: active.type, }, }, 0)
  tl.to(inhab, { scrambleText: { text: active.inhab, }, }, 0)
  units.forEach((_unit, index) =>
    tl.to(units[index], { scrambleText: { text: '_:0' + active.units[index].toString(), }, }, 0)
  )
  const topos = Array.from(document.querySelector('.topology')?.children ?? [])
  topos.forEach(el => el.classList.add('topohidden'))
  topos[active.index - 1].classList.remove('topohidden')
}

function setColor() {
  const r: HTMLElement | null = document.querySelector(':root');
  const starname = starState.front.name as StarName
  r?.style.setProperty('--color', data[starname].color);
  r?.style.setProperty('--hue', data[starname].hue + "deg");

  // test border
  // if (starState.front === star2) {
  //   r?.style.setProperty('--border', '1px solid #00000055');
  //   r?.style.setProperty('--border-info', '1px solid #00000033');
  // }
  // else {
  //   r?.style.setProperty('--border', '1px solid #000');
  //   r?.style.setProperty('--border-info', '1px solid #00000055');
  // }
}

function moveStars(direction: "prev" | "next") {
  const index = document.querySelector('.index')
  const symbol = document.querySelector('.symbol')
  const core = scene.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>

  core.material.opacity = 1
  const tl: GSAPTimeline = gsap.timeline({ defaults: { duration: 0.25, ease: "power3.inOut" } })
  tl
    .to(index, {
      translateX: direction === "prev" ? "1rem" : "-1rem",
      ease: "power3.out",
      duration: 0.35
    })
    .to(index, {
      translateX: 0,
      ease: "back.out",
    }, 0.35)
    .to(symbol, {
      marginTop: direction === "next" ? "1.5rem" : "-1.5rem",
      ease: "power3.out",
      duration: 0.35
    }, 0)
    .to(symbol, {
      // marginTop: "1.5rem",
      marginTop: "0",
      ease: "back.out",
    }, 0.35)
    .to(
      [starState.left.position, starState.right.position, starState.front.position], {
      x: -30, y: 1.5,
      onComplete: () => {
        scene.remove(starState.left)
        scene.remove(starState.right)
        scene.add(starState.front)
      }
    }, 0)
    .to(
      [starState.left.position, starState.right.position, starState.front.position],
      { x: 0, y: 0 },
      0.25)
}

function updateCoords() {
  const timedate = document.querySelector(".timedate")
  const elements = document.querySelectorAll('.coord')
  const coords = ['ϰ', 'λ', 'ϟ']
  setInterval(
    () => {
      elements.forEach((e, index) =>
        gsap.to(e, {
          scrambleText: {
            text: coords[index] + "_" + (Math.random() * 999).toString(),
            chars: "0123456798",
            revealDelay: 0.2
          },
          duration: 0.5
        }))
      const date = new Date(Date.now() + 32123456789099)
      const formated = `α:_ 0εx${date.getSeconds()}`
      timedate!.innerHTML = formated
    },
    1500
  )
}

function raycast(e: MouseEvent) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const core = scene.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>
  const intersects = raycaster.intersectObjects([core]);
  intersects.forEach((_e: any) => {
    if (core.material.opacity === 0.11) {
      core.material.opacity = 1
      setColor()
    } else {
      core.material.opacity = 0.11
      var r: HTMLElement | null = document.querySelector(':root');
      r?.style.setProperty('--color', 'transparent');
    }
  })
}

function raycastinfo(e: MouseEvent) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const core = scene.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>
  const focus: HTMLElement | null = document.querySelector('.coreFocus')
  const intersects = raycaster.intersectObjects([core]);
  intersects.forEach((_e: any) => {
    document.querySelector('body')!.style.cursor = "pointer"
    focus!.style.opacity = '1';
  })
  if (!intersects || intersects.length === 0) {
    document.querySelector('body')!.style.cursor = "default"
    focus!.style.opacity = '0';
  }
}

// ANIMATE
function animate() {
  const core = scene.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>
  if (core.material.opacity === 0.11) {
    starState.front.rotation.y -= 0.00075
    starState.front.rotation.z -= 0.00075
  }
  else if (starState.front === star1) {
    rotateStar1()
  } else if (starState.front === star2) {
    rotateStar2()
  } else {
    rotateStar3()
  }

  requestAnimationFrame(animate)
  delta += clock.getDelta();
  if (delta > interval) {
    renderer.render(scene, camera)
    delta = delta % interval;
  }
}

function fade() {
  const ui = document.querySelector('.data')
  const vx = document.querySelector('.vx')
  const ctrl = document.querySelector('.controls')
  const load = document.querySelector('.loading')
  const num = document.querySelector('.loadpercent')
  const focus = document.querySelector('.coreFocus')
  const tl = gsap.timeline({ defaults: { duration: .3 } });

  tl
    .set(ui, {
      scaleY: 0,
    })
    .set(vx, {
      scale: 0.8,
      translateY: '1rem',
      opacity: 0
    })
    .set(ctrl, {
      scaleY: 0,
      opacity: 0
    })
    .set(["p", ".horisep"], {
      opacity: 0
    })
    .set(focus, {
      display: "none"
    })

  tl
    .to(document.body, { autoAlpha: 1, })
    .to(load, {
      width: isMobile ? "95vw" : "40vw",
      duration: 0.8,
      delay: 0.2,
      ease: "power1.out"
    })
    .to(num, {
      textContent: 100,
      snap: { textContent: 1 },
      duration: 0.8,
      ease: "power1.out"
    }, "<")
    .to(load, {
      autoAlpha: 0,
      duration: 0
    })
    .to(ui, {
      scaleY: 1,
      duration: 0.7,
      ease: "power2.out"
    })
    .to(ctrl, {
      scaleY: 1,
      opacity: 1
    }, "< 0.25")
    .to(vx, {
      scale: 1,
      translateY: 0,
      opacity: 1,
      delay: 0.05,
      duration: 0.6,
      ease: "power3.out"
    }, "< 0.1")
    .to(["p", ".horisep"], {
      opacity: 1
    }, "< -0.1")
    .to(focus, {
      display: "grid"
    }, "< -0.1")
}

// INIT
fade()
createCore()
createStar1()
createStar2()
createStar3()
scene.add(star1)

animate()
updateCoords()
