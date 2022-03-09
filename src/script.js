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

import { gsap } from "gsap";
import { Timeline } from 'gsap/gsap-core'
import { ScrollTrigger } from "gsap/ScrollTrigger";


/**
 * Debug
 */
//  const gui = new dat.GUI()



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')
const canvas2 = document.querySelector('.webgl2')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    width2: document.querySelector('.section2').offsetWidth,
    height2: document.querySelector('.section2').offsetHeight
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
camera.position.y = 0
camera.position.z = 20

scene.add(camera)


// Debug
// gui.add(camera.position, 'x').min(-10).max(10).step(0.01).name('camera position x')
// gui.add(camera.position, 'y').min(-10).max(10).step(0.01).name('camera position y')
// gui.add(camera.position, 'z').min(-10).max(10).step(0.01).name('camera position z')



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Geometries
 */

// Dodecahedron
const dodecahedron = new THREE.DodecahedronGeometry(9,10)
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
polyhedron.position.y = 0
polyhedron.position.x = 10

scene.add(polyhedron)

// Planes for images

// const planePictures = new THREE.PlaneBufferGeometry(img1.clientWidth,img1.clientHeight,10,10)
// const planeMaterial = new THREE.ShaderMaterial({
//     uniforms:{
//         uTime: {value:0},
//     },
//     wireframe:true,
// })
// const planePicture = new THREE.Mesh(planePictures,planeMaterial)

// scene.add(planePicture)

// Debug

// gui.add(polyhedron.position, 'x').min(-10).max(10).step(0.01).name('poly position x')
// gui.add(polyhedron.position, 'y').min(-10).max(10).step(0.01).name('poly position y')
// gui.add(polyhedron.position, 'z').min(-10).max(10).step(0.01).name('poly position z')

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
// const planeGeometry = new THREE.PlaneGeometry(40,40,50,50)
// const material2 = new THREE.MeshStandardMaterial({
//     color: 0x000000,
//     wireframe:true
// })
// const plane = new THREE.Mesh(planeGeometry,material2)
// plane.rotation.x = Math.PI *0.5
// plane.position.y = -10
// scene.add(plane)

// Debug
// gui.add(mirror.position, 'x').min(-10).max(10).step(0.01).name('mirror position x')
// gui.add(mirror.position, 'y').min(-10).max(10).step(0.01).name('mirror position y')
// gui.add(mirror.position, 'z').min(-10).max(10).step(0.01).name('mirror position z')




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
 * GSAP & Animations
 */

// Images

const canvasImages = document.getElementById('images-canvas')
const ctx = canvasImages.getContext('2d')
const links = [... document.querySelectorAll('li')]
const lerp = (start,end,time) =>{
    return start*(1-time) + end*time
}
for(let i =0 ; i<links.length ; i++){
    links[i].addEventListener('mouseover',()=>{
        for(let j =0;j<links.length;j++){
            if(j!== i){
                links[j].style.opacity =0.2;
                links[j].style.zIndex=0;
            }else{
                links[j].style.opacity=1;
                links[j].style.zIndex=3
            }
        }
    })
    links[i].addEventListener('mouseleave',()=>{
        for(let i = 0; i<links.length;i++){
            links[i].style.opacity = 1;
        }
    })
}
let imgIndex = 0;
// loading images into array
const imgs = [
    '/img/viajesChile.png',
    '/img/animalesSalvajes.png',
    '/img/apiSuperHero.png',
    '/img/undergroundSociety.png'
]
let imgArr = [];
// canvas mousemove variables
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
window.addEventListener('mousemove',(e)=>{
    targetX = e.clientX;
    targetY = e.clientY;
})
imgs.forEach((img,idx)=>{
    let elImage = new Image(300)
    elImage.src = img
    elImage.classList.add('project-image')
    document.body.appendChild(elImage)
    imgArr.push(elImage)
})

// draw images to the canvas
let percent = 0
let target = 0
function drawImage(index){
    let {width,height} = imgArr[index].getBoundingClientRect()
    canvasImages.width = width * window.devicePixelRatio;
    canvasImages.height = height * window.devicePixelRatio;
    canvasImages.style.width = `${width}px`
    canvasImages.style.height = `${height}px`
    
     // pixelate by diabling the smoothing
     ctx.webkitImageSmoothingEnabled = false;
     ctx.mozImageSmoothingEnabled = false;
     ctx.msSmoothingEnabled = false;
     ctx.imageSmoothingEnabled = false;
    if(target === 1){ // Link has been hovered
        // 2 speeds to make the effect more gradual
        if(percent < 0.2){
            percent += .01;
        }else if(percent < 1){
            percent += .1;
        }
    }else if(target === 0){
        if(percent > 0.2){
            percent -= .3
        }else if( percent > 0){
            percent -= .01;
        }
    }

    let scaledWidth = width * percent;
    let scaledHeight = height * percent;

    if(percent >= 1){
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.drawImage(imgArr[index], 0, 0, width, height);
    }else{
        ctx.drawImage(imgArr[index], 0, 0, scaledWidth, scaledHeight);
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        if(canvasImages.width !== 0 && canvasImages.height !== 0){
            ctx.drawImage(canvasImages, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height)
        }
    }
}
for(let i = 0; i < links.length; i++){
    links[i].addEventListener('mouseover', () => {
        for(let j = 0; j < links.length; j++){
            if(j !== i){
                links[j].style.opacity = 0.2;
                links[j].style.zIndex = 0;
            }else{
                links[j].style.opacity = 1;
                links[j].style.zIndex = 3;
            }
        }
    })

    links[i].addEventListener('mouseleave', () => {
        for(let i = 0; i < links.length; i++){
            links[i].style.opacity = 1;
        }
    })

    links[i].addEventListener('mouseenter', () => {
        imgIndex = i;
        target = 1
    });

    links[i].addEventListener('mouseleave', () => {
        target = 0;
    })
}
function animate(){
    
    currentX = lerp(currentX, targetX, 0.075);
    currentY = lerp(currentY, targetY, 0.075);
    let { width, height} = imgArr[imgIndex].getBoundingClientRect();
    canvasImages.style.transform = `translate3d(${currentX - (width / 2)}px, ${currentY - (height / 2)}px, 0)`;
    drawImage(imgIndex);
    window.requestAnimationFrame(animate);
}

animate()

// add eventlistener to images

// const blackToColor = (number)=>{
//     const tl = new Timeline()
//     tl.to(`#displacementMap${number}`, {
//         ease: "back",
//         duration: 0.25,
//         attr: {scale: 100,}
//        })
//     .to(`#displacementMap${number}`, {
//         ease: "power4",
//         duration: 0.25,
//         attr: {scale: 0}
//        }
//     )
//     tl.to(`#colorMatrix${number}`,{
//         ease:'back',
//         duration:0.25,
//         attr:{
//             values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
//         },
//     }, '<')
// }

// const colorToBlack = (number)=>{
//     const tl = new Timeline()
//     tl.to(`#displacementMap${number}`, {
//         ease: "back",
//         duration: 0.25,
//         attr: {scale: 100,}
//        })
//     .to(`#displacementMap${number}`, {
//         ease: "power4",
//         duration: 0.25,
//         attr: {scale: 0}
//        })
//     tl.to(`#colorMatrix${number}`,{
//         ease:'back',
//         duration:0.25,
//         attr:{
//             values: ".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"
//         },
//     }, '<')
// }


// const img1 = document.getElementById('project1')
// const img2 = document.getElementById('project2')
// const img3 = document.getElementById('project3')
// const img4 = document.getElementById('project4')

// const images = [img1,img2,img3,img4]
// // const turbulence = document.getElementById('turbulence')

// images.forEach((element,index)=> {
//     element.addEventListener('mouseover',()=>blackToColor(index+1))
//     element.addEventListener('mouseout',()=>colorToBlack(index+1))
// })
// gsap.registerPlugin(ScrollTrigger)

// Scroll snapping MANTENER DESDE ACA ABAJO COMENTADO

// gsap.to('.section1',{
//     scrollTrigger:{
//         trigger: '.section1',
//         start: 'bottom 90%',
//         markers:true,
//         toggleActions:'play none none none',
//     },

// })

// Scroll animation for images

// const animatingProjects = (projectNumber)=>{
//     if(projectNumber%2==0){
//         const timelineProjects = new Timeline({
//             scrollTrigger:{
                // scroller: '.page',
//                 trigger: `#project${projectNumber}`,
//                 start: 'top 90%',
//                 markers:true,
//                 toggleActions:'play none none none',
//             }
//         }).from(
//             `#project${projectNumber}`,{
//                 x:500, opacity:0, duration:1.5
//              }
//         )
//     }else{
//         const timelineProjects = new Timeline({
//             scrollTrigger:{
//                 // scroller: '.page',
//                 trigger: `#project${projectNumber}`,
//                 start: 'top 90%',
//                 markers:true,
//                 toggleActions:'play none none none',
//             }
//         }).from(
//             `#project${projectNumber}`,{
//                 x:-500, opacity:0, duration:1.5
//              }
//         )
//     }
// }

// for (let i=1 ; i<5; i++){
//     animatingProjects(i)
// }

// HASTA ACAAAAAAA

// const timelineProjects1 = new Timeline({
//     scrollTrigger:{
//         // scroller: '.page',
//         trigger: `#project1`,
//         start: 'top 75%',
//         // markers:true,
//         toggleActions:'play pause none none',
//     }
// }).from(
//     `#project1`,{
//         x:500, opacity:0, duration:1.5
//      }
// )
// const timelineProjects2 = new Timeline({
//     scrollTrigger:{
//         // scroller: '.page',
//         trigger: `#project2`,
//         start: 'top 75%',
//         // markers:true,
//         toggleActions:'play pause none none',
//     }
// }).from(
//     `#project2`,{
//         x:-500, opacity:0, duration:1.5
//      }
// )
// const timelineProjects3 = new Timeline({
//     scrollTrigger:{
//         // scroller: '.page',
//         trigger: `#project3`,
//         start: 'top 75%',
//         // markers:true,
//         toggleActions:'play pause none none',
//     }
// }).from(
//     `#project3`,{
//         x:500, opacity:0, duration:1.5
//      }
// )
// const timelineProjects4 = new Timeline({
//     scrollTrigger:{
//         // scroller: '.page',
//         trigger: `#project4`,
//         start: 'top 75%',
//         // markers:true,
//         toggleActions:'play pause none none',
//     }
// }).from(
//     `#project4`,{
//         x:-500, opacity:0, duration:1.5
//      }
// )

// Scroll Animation for sphere


// const tl2 = new Timeline(
//     {scrollTrigger: {
//         // scroller: '.page',
//         trigger:'.section2',
//         start:'top center',
//         end: 'bottom center',
//         toggleActions:'play pause none none',
//     },}
//     ).to(camera.position,{
//         ease:'power0',
//         z:0,
//         y:-20,
//         duration:2.4
//     }).to(material1.uniforms.uStrengthNoise, {
//         ease: 'power3',
//         value:7,
//         duration:2
//     })

// keep this commented
    // .to(camera.position,{
    //     ease: 'power3',
    //     z:-20,
    //     y:0,
    //     duration:3.0
    // },"<")
// up to this comment



// const tl3 = new Timeline({
//     scrollTrigger: {
//         // scroller: '.page',
//         trigger:'.section3',
//         start:'top center',
//         end: 'bottom center',
//         toggleActions:'play pause none none',
//     },
//     }).to(camera.position,{
//         ease: 'power0',
//         z:35,
//         y:0,
//         duration:2.4
//     })
//     .to(polyhedron.position,{
//         ease: 'power0',
//         x:25,
//         duration:2.4
//     },'<')
//     .to(material1.uniforms.uStrengthNoise ,{
//         ease: 'power3',
//         value:12,
//         duration:2})
    

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
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()