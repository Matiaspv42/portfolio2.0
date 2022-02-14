import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Debug
 */
 const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 5
camera.position.z = 20
scene.add(camera)

// Debug
gui.add(camera.position, 'x').min(-10).max(10).step(0.01).name('camera position x')
gui.add(camera.position, 'y').min(-10).max(10).step(0.01).name('camera position y')
gui.add(camera.position, 'z').min(-10).max(10).step(0.01).name('camera position z')



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Geometries
 */

// Dodecahedron
const dodecahedron = new THREE.DodecahedronGeometry(5,5)
const material1 = new THREE.MeshBasicMaterial(
    {
        wireframe:true,
        color: 0x000000,
    }
)

const polyhedron = new THREE.Mesh(dodecahedron, material1)
polyhedron.position.y = 5

scene.add(polyhedron)

// Debug

gui.add(polyhedron.position, 'x').min(-10).max(10).step(0.01).name('poly position x')
gui.add(polyhedron.position, 'y').min(-10).max(10).step(0.01).name('poly position y')
gui.add(polyhedron.position, 'z').min(-10).max(10).step(0.01).name('poly position z')

// Plane
const planeGeometry = new THREE.PlaneGeometry(40,40,50,50)
const material2 = new THREE.MeshBasicMaterial(
    {
        wireframe: true,
        color: 0x202b31,
    }
)
const water = new THREE.Mesh(planeGeometry, material2)
water.rotation.x = Math.PI*0.5
water.position.y = -5
scene.add(water)

// Debug
gui.add(water.position, 'x').min(-10).max(10).step(0.01).name('water position x')
gui.add(water.position, 'y').min(-10).max(10).step(0.01).name('water position y')
gui.add(water.position, 'z').min(-10).max(10).step(0.01).name('water position z')




/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()