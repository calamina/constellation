import * as THREE from "three"
import { gsap } from "gsap";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import data from './assets/data.json'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DOM, COLORS, isMobile } from "./assets/util";
import type { StarName, Star, StarData } from "./assets/util";
gsap.registerPlugin(ScrambleTextPlugin)

// FPS
let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 120;
let isInteractingControls = false

// SIZE
let dataWidth = DOM.data?.getBoundingClientRect().width ?? 0
let dataHeight = DOM.data?.getBoundingClientRect().height ?? 0

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(dataWidth / dataHeight)

renderer.setSize(dataWidth, dataHeight - 2)
renderer.setClearColor(0x000000, 0)
DOM.data?.appendChild(renderer.domElement)

// CAMERA & RAYCASTER
const camera = new THREE.PerspectiveCamera(
  50, dataWidth / dataHeight
)
const raycaster = new THREE.Raycaster
const pointer = new THREE.Vector2();

camera.position.set(Math.PI + 0.86, 0, 0)
camera.lookAt(0, 0, 0)
raycaster.setFromCamera(pointer, camera);

// SCENE
const scene = new THREE.Scene()
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
controls.enablePan = false

// STARS
const star1 = new THREE.Group()
star1.name = "star1"
const star2 = new THREE.Group()
star2.name = "star2"
const star3 = new THREE.Group()
star3.name = "star3"

const stars: Star[] = [
  {
    name: "star1",
    star: star1,
    rotate: rotateStar1,
    data: data.star1
  },
  {
    name: "star2",
    star: star2,
    rotate: rotateStar2,
    data: data.star2,
  },
  {
    name: "star3",
    star: star3,
    rotate: rotateStar3,
    data: data.star3,
  }
]

let activeStar: Star = stars[0]

// EVENTS
window.addEventListener('pointerdown', raycast);
window.addEventListener('pointermove', raycastinfo);
window.addEventListener("resize", onWindowResize)
DOM.next?.addEventListener("click", next)
DOM.previous?.addEventListener("click", previous)
controls.addEventListener("start", () => isInteractingControls = true)
controls.addEventListener("end", () => setTimeout(() => isInteractingControls = false, 1000))
document.addEventListener('keydown', (event) => {
  if (event.key === "ArrowLeft") previous()
  else if (event.key === "ArrowRight") next()
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
  dataWidth = DOM.data?.getBoundingClientRect().width ?? 0
  dataHeight = DOM.data?.getBoundingClientRect().height ?? 0
  renderer.setSize(dataWidth, dataHeight - 2)
  renderer.setPixelRatio(dataWidth / dataHeight)
  camera.aspect = (dataWidth / dataHeight)
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
  const index = stars.indexOf(activeStar)
  const nextStar = stars[index === stars.length - 1 ? 0 : index + 1]
  moveStars("next", nextStar)
}

function previous() {
  const index = stars.indexOf(activeStar)
  const prevStar = stars[index === 0 ? stars.length - 1 : index - 1]
  moveStars("prev", prevStar)
}

function setData(data: StarData) {
  const titleElements = Array.from(DOM.main?.children ?? [])
  const infoElements = Array.from(DOM.type?.children ?? [])
  const [name, scientific, galaxy] = titleElements
  const [distance, type, inhab] = infoElements

  const tl = gsap.timeline({ defaults: { duration: 0.3, scrambleText: { text: "", tweenLength: false, chars: "lowerCase" } } })

  tl.call(() => { DOM.index!.innerHTML = data.index.toString() })
  tl.to(name, {
    scrambleText: { text: data.name, },
  }, 0)
  tl.to(scientific, {
    scrambleText: { text: data.scientific, },
  }, 0)
  tl.to(galaxy, {
    scrambleText: { text: data.galaxy, },
  }, 0)
  tl.to(distance, {
    scrambleText: { text: data.distance, },
  }, 0)
  tl.to(type, {
    scrambleText: { text: data.type, },
  }, 0)
  tl.to(inhab, {
    scrambleText: { text: data.inhab, },
  }, 0)

  DOM.units.forEach((_unit, index) =>
    tl.to(DOM.units[index], {
      scrambleText: { text: '_:0' + data.units[index].toString(), },
    }, 0)
  )
  const topos = Array.from(DOM.topology?.children ?? [])
  topos.forEach(el => el.classList.add('topohidden'))
  topos[data.index - 1].classList.remove('topohidden')
}

function setColor(name?: StarName) {
  const starname = name ?? activeStar.name
  DOM.root?.style.setProperty('--color', data[starname].color);
  DOM.root?.style.setProperty('--hue', data[starname].hue + "deg");
}

function moveStars(direction: "prev" | "next", star: Star) {
  const core = scene.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>
  core.material.opacity = 1
  const tl: GSAPTimeline = gsap.timeline({ defaults: { duration: 0.25, ease: "power3.inOut" } })

  setColor(star.name)
  setData(star.data)

  tl
    .to(DOM.indexBox, {
      translateX: direction === "prev" ? "1rem" : "-1rem",
      ease: "power3.out",
      duration: 0.35,
    })
    .to(DOM.indexBox, {
      translateX: 0,
      ease: "back.out",
    }, 0.35)
    .to(DOM.symbol, {
      marginTop: direction === "next" ? "1.5rem" : "-1.5rem",
      ease: "power3.out",
      duration: 0.35
    }, 0)
    .to(DOM.symbol, {
      marginTop: "0",
      ease: "back.out",
    }, 0.35)
    .to(
      [...stars.map(star => star.star.scale)], {
      x: 0, y: 0, z: 0,
      onComplete: () => {
        scene.remove(activeStar.star)
        activeStar = star
        scene.add(activeStar.star)
      }
    }, 0)
    .to(
      [...stars.map(star => star.star.scale)],
      { x: 1, y: 1, z: 1 },
      0.25)
}

function updateCoords() {
  const symbols = ['ϰ', 'λ', 'ϟ']
  setInterval(
    () => {
      const ref = [camera.position.x, camera.position.y, camera.position.z]
      DOM.coords.forEach((e, index) =>
        gsap.to(e, {
          scrambleText: {
            text: symbols[index] + "_" + ref[index],
            // text: symbols[index] + "_" + (Math.random() * 999).toString(),
            chars: "0123456798",
            revealDelay: 0.2
          },
          duration: 0.5
        }))
      const date = new Date(Date.now() + 32123456789099)
      const formated = `α:_ 0εx${date.getSeconds()}`
      DOM.timedate!.innerHTML = formated
    },
    1500
  )
}

function raycast(e: MouseEvent) {
  getPointer(e)
  const core = scene.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>
  const intersects = raycaster.intersectObjects([core]);
  intersects.forEach((_e: any) => {
    swingFrontStar()
    toggleCore(core)
  })
}

function toggleCore(core: THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>) {
  const coreActive = core?.material?.opacity === 1

  if (!coreActive) {
    setColor()
    core.material.opacity = 1;
    timeAnimations(1)
  } else {
    DOM.root?.style.setProperty('--color', 'transparent');
    core.material.opacity = 0.11;
    timeAnimations(0.1)
  }
}

function swingFrontStar() {
  const rotation = activeStar.star.rotation
  gsap.to(rotation, {
    x: rotation.x + (Math.PI / ((Math.random() + 0.3) * 3)),
    y: rotation.y + (Math.PI / ((Math.random() + 0.3) * 3)),
    z: rotation.z + (Math.PI / ((Math.random() + 0.3) * 3)),
    duration: 1,
    ease: "power2.out"
  })
}

function timeAnimations(time: number) {
  const animationNames = ["orbit", "pulse", "baranim", "lineanim"];
  DOM.animations.forEach((animation: CSSAnimation) => {
    if (animationNames.includes(animation.animationName))
      animation.playbackRate = time;
  })
}

function raycastinfo(e: MouseEvent) {
  getPointer(e)
  const core = scene.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>
  const intersects = raycaster.intersectObjects([core]);
  intersects.forEach((_e: any) => {
    DOM.body!.style.cursor = "pointer"
    DOM.coreFocus!.style.opacity = '1';
    DOM.danger!.style.display = "none";
    [...DOM.path, DOM.topology].forEach((el) => el?.classList.add("activated"))
  })
  if (!intersects || intersects.length === 0) {
    DOM.body!.style.cursor = "default"
    DOM.coreFocus!.style.opacity = '0';
    DOM.danger!.style.display = "flex";
    [...DOM.path, DOM.topology].forEach((el) => el?.classList.remove("activated"));
  }
}

function getPointer(e: MouseEvent) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1.01;
  pointer.y = - (e.clientY / window.innerHeight) * 2 + 0.85;
  raycaster.setFromCamera(pointer, camera);
}

// ANIMATE
function animate() {
  updateUI()
  requestAnimationFrame(animate)
  controls.update();
  delta += clock.getDelta();
  if (delta > interval) {
    renderer.render(scene, camera)
    delta = delta % interval;
  }
}

function updateUI() {
  const coreFocusVisible = DOM.coreFocus?.style.opacity === "1"
  const coreDisabled = (scene?.getObjectByName("core") as THREE.Mesh<THREE.SphereGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>)?.material?.opacity !== 1

  if (coreDisabled || coreFocusVisible || isInteractingControls) {
    DOM.danger!.style.display = "none";
    if (coreDisabled) {
      DOM.control!.style.display = "flex";
      [...DOM.coords].forEach(coord => coord.style.display = "none");
    }
  }
  else {
    DOM.danger!.style.display = "flex";
    DOM.control!.style.display = "none";
    [...DOM.coords].forEach(coord => coord.style.display = "flex");
    activeStar.rotate()
  }
}

function fade() {
  const tl = gsap.timeline({ defaults: { duration: .3 } });
  tl
    .set(DOM.ui, {
      scaleY: 0,
    })
    .set(DOM.vx, {
      scale: 0.8,
      translateY: '1rem',
      opacity: 0
    })
    .set(DOM.ctrl, {
      scaleY: 0,
      opacity: 0
    })
    .set(["p", ".horisep"], {
      opacity: 0
    })
    .set(DOM.coreFocus, {
      display: "none"
    })

  tl
    .to(DOM.body, { autoAlpha: 1, })
    .to(DOM.load, {
      width: isMobile ? "calc(100vw - 1rem)" : "40vw",
      duration: 0.8,
      delay: 0.2,
      ease: "power1.out"
    })
    .to(DOM.num, {
      textContent: 100,
      snap: { textContent: 1 },
      duration: 0.8,
      ease: "power1.out"
    }, "<")
    .to(DOM.load, {
      autoAlpha: 0,
      display: "none",
      duration: 0
    })
    .to(DOM.ui, {
      scaleY: 1,
      duration: 0.7,
      ease: "power2.out"
    })
    .to(DOM.ctrl, {
      scaleY: 1,
      opacity: 1
    }, "< 0.25")
    .to(DOM.vx, {
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
    .to(DOM.coreFocus, {
      display: "grid"
    }, "< -0.1")
}

function updateGraphData() {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.15 })
  tl.to(DOM.graphData, {
    scrambleText: {
      text: "⠥⠏⠺⠁⠗⠙⠎",
      chars: "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠭⠽⠵",
      revealDelay: 1
    },
    duration: 2,
  }, 0)
}

function updateSuccess() {
  const tl = gsap.timeline({ repeat: -1 })
  tl
    .to(DOM.controlText, {
      scrambleText: {
        text: "core recharged ⠞ [(under control)]",
        chars: "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠭⠽⠵",
      },
      duration: 3,
    })
    .to(DOM.controlText, {
      scrambleText: {
        text: "core recharged ⠞ [(under control)]",
        chars: "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠭⠽⠵",
        rightToLeft: true
      },
      reversed: true,
      duration: 3,
    })
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
updateGraphData()
updateSuccess()
