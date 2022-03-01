import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import waterVertexShader from './shaders/waterMirror/vertex.glsl'
import waterFragmentShader from './shaders/waterMirror/fragment.glsl'
import sphereVertexShader from './shaders/sphereShader/vertex.glsl'
import sphereFragmentShader from './shaders/sphereShader/fragment.glsl'
import { Reflector } from 'three/examples/jsm/objects/Reflector'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
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

// camera.fov = 2* Math.atan((sizes.height/2)/20)*(180/Math.PI)
// console.log(camera.fov)
scene.add(camera)

// Debug
gui.add(camera.position, 'x').min(-10).max(10).step(0.01).name('camera position x')
gui.add(camera.position, 'y').min(-10).max(10).step(0.01).name('camera position y')
gui.add(camera.position, 'z').min(-10).max(10).step(0.01).name('camera position z')



// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true


/**
 * Geometries
 */

// Dodecahedron
const dodecahedron = new THREE.DodecahedronGeometry(5,10)
// const dodecahedron = new THREE.SphereGeometry( 5, 100, 100 )

const vectors = [
    new THREE.Vector3( 1, 0, 0 ),
    new THREE.Vector3( 0, 1, 0 ),
    new THREE.Vector3( 0, 0, 1 )
];

const position = dodecahedron.attributes.position;
const centers = new Float32Array( position.count * 3 );

for ( let i = 0, l = position.count; i < l; i ++ ) {
    vectors[ i % 3 ].toArray( centers, i * 3 )
}


dodecahedron.setAttribute( 'center', new THREE.BufferAttribute( centers, 3 ) );

const material1 = new THREE.ShaderMaterial({
    vertexShader:sphereVertexShader,
    fragmentShader:sphereFragmentShader,
    uniforms: { 
        'uThickness': {value: 1} ,
        'uTime':{value:0.01},
        'uStrengthNoise':{value:1.0}
    },
    side: THREE.DoubleSide,
	alphaToCoverage: true // only works when WebGLRenderer's "antialias" is set to "true"
})

material1.extensions.derivatives = true;


const polyhedron = new THREE.Mesh(dodecahedron, material1)
polyhedron.position.y = 5

scene.add(polyhedron)

// Planes for images

// const planePictures = new THREE.PlaneBufferGeometry(100,100,10,10)
// const planeMaterial = new THREE.ShaderMaterial({
//     uniforms:{
//         uTime: {value:0},
//     },
//     wireframe:true,
// })
// const planePicture = new THREE.Mesh(planePictures,planeMaterial)
// scene.add(planePicture)

// Debug

gui.add(polyhedron.position, 'x').min(-10).max(10).step(0.01).name('poly position x')
gui.add(polyhedron.position, 'y').min(-10).max(10).step(0.01).name('poly position y')
gui.add(polyhedron.position, 'z').min(-10).max(10).step(0.01).name('poly position z')

// Mirror
// const planeGeometry = new THREE.PlaneGeometry(40,40,50,50)
// const mirror = new Reflector(planeGeometry, {
//     clipBias: 0.003,
//     textureWidth: window.innerWidth * window.devicePixelRatio,
//     textureHeight: window.innerHeight * window.devicePixelRatio,
//     color: 0x777777
// })

// mirror.rotation.x = -Math.PI*0.5
// mirror.position.y = -5
// scene.add(mirror)

// Plane
const planeGeometry = new THREE.PlaneGeometry(40,40,50,50)
const material2 = new THREE.MeshStandardMaterial({
    color: 0x000000,
    wireframe:true
})
const plane = new THREE.Mesh(planeGeometry,material2)
plane.rotation.x = Math.PI *0.5
plane.position.y = -5
scene.add(plane)

// Debug
// gui.add(mirror.position, 'x').min(-10).max(10).step(0.01).name('mirror position x')
// gui.add(mirror.position, 'y').min(-10).max(10).step(0.01).name('mirror position y')
// gui.add(mirror.position, 'z').min(-10).max(10).step(0.01).name('mirror position z')


/**
 * Light
 */



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

// Postprocessing

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene,camera)
composer.addPass(renderPass)

var counter = 0.0;
const myEffect = {
    uniforms: {
        "tDiffuse": { value: null },
        "scrollSpeed": { value: null },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix 
        * modelViewMatrix 
        * vec4( position, 1.0 );
    }
    `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    uniform float scrollSpeed;
    void main(){
        vec2 newUV = vUv;
        float area = smoothstep(0.4,0.,vUv.y);
        area = pow(area,4.);
        newUV.x -= (vUv.x - 0.5)*0.1*area*scrollSpeed;
        gl_FragColor = texture2D( tDiffuse, newUV);
    //   gl_FragColor = vec4(area,0.,0.,1.);
    }
    `
}

const customPass = new ShaderPass(myEffect);
customPass.renderToScreen = true;
composer.addPass(customPass);

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

    // update uTime
    material1.uniforms.uTime.value = elapsedTime

    // Update controls
    // controls.update()

    // Render
    // renderer.render(scene, camera)
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()