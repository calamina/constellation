import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { Timer } from "three/examples/jsm/Addons.js"

const timer = new Timer()
let clock = 0
let step = 0

// RENDERER
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 0)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x555555, 1)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
)
camera.position.set(-8, 8, -8)

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(5, 0, 5)
controls.enableZoom = false
controls.enablePan = false
controls.update()

// SCENE
const scene = new THREE.Scene()

window.addEventListener("resize", onWindowResize)

const group = new THREE.Group()
scene.add(group)

function animate(timestamp: number) {
  timer.update(timestamp)
  const elapsed = timer.getElapsed()
  // group.position.y -= .04

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
  if (elapsed * 16 > clock) {
    clock++
    // camera.position.y += 1
    setupWorld(1)
    // setupWorld(clock)
    // setupWorld(clock/16)
    step = step === toStair(0).length - 1 ? 0 : step + 1
    return
  }
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

function setupLights() {
  const light1 = new THREE.DirectionalLight(0xffffff, 1)
  light1.position.set(1, 1, 1)
  scene.add(light1)

  const light2 = new THREE.DirectionalLight(0xffffff, 1)
  light2.position.set(-1, -1, -0.5)
  scene.add(light2)

  const ambient = new THREE.AmbientLight(0x404040)
  ambient.intensity = 0.1
  scene.add(ambient)
}


function toStair(i: number): number[][] {
  return [
    [0, i, 0],
    [0, i, 1],
    [0, i, 2],
    [0, i, 3],
    [0, i, 4],
    [1, i, 4],
    [2, i, 4],
    [3, i, 4],
    [4, i, 4],
    [4, i, 3],
    [4, i, 2],
    [4, i, 1],
    [4, i, 0],
    [3, i, 0],
    [2, i, 0],
    [1, i, 0]
  ]
}

// const grid = new THREE.GridHelper(14, 14)
// grid.position.set(5, 0, 5)
// scene.add(grid)

// const ground = new THREE.BoxGeometry(14, 6, 14)
// const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
// const planeMesh = new THREE.Mesh(ground, planeMaterial)
// planeMesh.position.set(5, -3, 5)
// scene.add(planeMesh)

function setupWorld(x: number) {
  const pos = toStair(x)[step]
  // const geometry = new THREE.BoxGeometry()
  // const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
  const geometry = new THREE.SphereGeometry(0.05, 10, 10)
  const material = new THREE.PointsMaterial({ color: 0xffffff })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(pos[0], pos[1], pos[2])
  group.add(cube)
  
  deleteCube()
}

function deleteCube() {
  if(group.children.length > 1) {
    group.remove(group.children[0])
  }
}
  // for (let lel of toStair(x)) {
  //   const geometry = new THREE.BoxGeometry()
  //   const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
  //   const cube = new THREE.Mesh(geometry, material)
  //   cube.position.set(lel[0] + 0.5, lel[1] + 0.5, lel[2] + 0.5)
  //   group.add(cube)
  // }

// function setupWorld(x: number) {
//   for (let i = 0; i < x; i++) {
//     for (let lel of test) {
//       const geometry = new THREE.BoxGeometry()
//       const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
//       const cube = new THREE.Mesh(geometry, material)
//       cube.position.set(lel[0] + 0.5, lel[1] + 0.5, lel[2] + 0.5)
//       scene.add(cube)
//     }
//   }
// }

setupLights()
animate(0)
