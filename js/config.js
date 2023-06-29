import * as THREE from './libs/three.module.js';
 import { GLTFLoader } from './libs/GLTFLoader.js';
import {OrbitControls} from './libs/OrbitControls.js';
let init, modelLoad,character,box,boxAnim,refCube;
let arrayObjects = [],mixer,mixerBox;
let anim = {
    'hi':'hi',
    'idle': 'idle',
    'dance': 'dance',
    'fight': 'fight',
    'walk': 'walk',
    'run':'run',
    'looking':'looking',
    'yes':'yes'
    
}
let animClips = [];
const clock = new THREE.Clock();


$(document).ready(function () {
    let detect = detectWebGL();
    if (detect == 1) {
        init = new sceneSetup(70, .05, 10, 2.5, 2.5, 3.5);
        modelLoad = new objLoad();
        modelLoad.Model();
        // window.database = init.scene;
        refCube = new THREE.CubeTextureLoader()
        .setPath( 'imgs/' )					
        .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );


        $('.forSpeach').on('click',function(){
            runSpeechRecog();
        })
        const runSpeechRecog = () => {
            const recognization = new webkitSpeechRecognition();
            recognization.onstart = () => {
                $("#forSpeach").attr("src","imgs/voice-on.png");
            }
            recognization.onresult = (e) => {      
                $("#forSpeach").attr("src","imgs/voice-off.png");         
                const transcript = e.results[0][0].transcript;
                const storeArray = transcript.split(" ");
                 storeArray.forEach(data => {
                    switch(data){
                        case "dance":
                            playAnimation(data);
                            break;
                        case "run":
                            playAnimation(data);
                            break;
                        case "walk":
                            playAnimation(data);
                            break;
                        case "fight":
                            playAnimation(data);
                            break;
                        case "stop":
                            playAnimation(data);
                            break;
                        case "hi":
                            playAnimation(data);
                            break;
                        case "hello":
                            playAnimation("hi");
                            break;
                    }
                 }); 
            }
            recognization.start();
         }

    } else if (detect == 0) {
        alert("PLEASE ENABLE WEBGL IN YOUR BROWSER....");
    } else if (detect == -1) {
        alert(detect);
        alert("YOUR BROWSER DOESNT SUPPORT WEBGL.....");
    }
    $('.actions').on('click',function(e){//0, 2.5, 4
        var src = ($('.open').attr('src') === 'imgs/close-cardboard-box.png') ? 'imgs/open-cardboard-box.png' : 'imgs/close-cardboard-box.png';
         $('.open').attr('src', src);
       
        TweenMax.to(init.cameraMain.position,1,{x:0, y:2.5, z:4,onUpdate:function(){
            init.cameraMain.updateProjectionMatrix();	
        },onComplete:()=>{
            if(e.target.id === "open"){
                $('.voiceWrapper').show();
                openClose(1);
                $('.open').attr('id', "close");
            }else{
                $('.voiceWrapper').hide();
                openClose(-1);
                $('.open').attr('id', "open");
            }            
        }});
        
    })


});
function detectWebGL() {
    // Check for the WebGL rendering context
    if (!!window.WebGLRenderingContext) {
        var canvas = document.createElement("canvas"),
            names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
            context = false;

        for (var i in names) {
            try {
                context = canvas.getContext(names[i]);
                if (context && typeof context.getParameter === "function") {
                    // WebGL is enabled.
                    return 1;
                }
            } catch (e) { }
        }

        // WebGL is supported, but disabled.
        return 0;
    }

    // WebGL not supported.
    return -1;
};
let material = {
    cube: new THREE.MeshLambertMaterial({
        //   map:THREE.ImageUtils.loadTexture("assets/Road texture.png"),
        color: 0xffffff,
        combine: THREE.MixOperation,
        side: THREE.DoubleSide
    }),
}
class sceneSetup {
    constructor(FOV, near, far, x, y, z, ambientColor) {
        this.container = document.getElementById("canvas");
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color( 0xa0a0a0 );
        // this.scene.fog = new THREE.Fog( 0xa0a0a0, 20, 100 );
        this.addingCube();
        this.camera(FOV, near, far, x, y, z);
        this.ambientLight(ambientColor);
        this.render();

    }
    camera(FOV, near, far, x, y, z) {
        this.cameraMain = new THREE.PerspectiveCamera(FOV, this.container.offsetWidth / this.container.offsetHeight, near, far);
        this.cameraMain.position.set(x, y, z);
        // this.cameraMain.lookAt(this.camPoint);
        this.cameraMain.lookAt(0, 0, 0);
        this.scene.add(this.cameraMain);
        this.rendering();
    }
    rendering() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.useLegacyLights = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.cameraMain, this.renderer.domElement);
        this.controls.target = new THREE.Vector3(0,2,0);
        this.controls.enableDamping = true;
        this.controls.dampingFactor  =  0.07;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 5;
        this.controls.maxPolarAngle = Math.PI / 2 * 115 / 120;
        // this.controls.minPolarAngle = 140 / 120;
        // this.controls.minAzimuthAngle = -280 / 120;
        // this.controls.maxAzimuthAngle = -115 / 120;
    }
    addingCube() {
        this.planeGeometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
        this.planeMaterial = new THREE.MeshStandardMaterial( { color: 0xf0eded,    combine: THREE.MixOperation,
            side: THREE.DoubleSide } )
        this.plane = new THREE.Mesh( this.planeGeometry, this.planeMaterial );
        this.plane.receiveShadow = true;
        this.scene.add( this.plane );
        this.plane.rotation.x = Math.PI / 2;
    }
    ambientLight(ambientColor) {
        this.ambiLight = new THREE.AmbientLight(0xffffff);
        this.light = new THREE.HemisphereLight(0xffffff, 0x000000, .5);
          this.scene.add(this.ambiLight);
         this.scene.add(this.light);
        this.directionalLightFront = new THREE.DirectionalLight( 0xffffff, 2);
        this.directionalLightFront.castShadow = true; 
        this.directionalLightFront.shadow.mapSize.width = 1024; // default
        this.directionalLightFront.shadow.mapSize.height = 1024; // default
        this.directionalLightFront.shadow.camera.near = 0.5; // default
        this.directionalLightFront.shadow.camera.far = 15; 
         this.directionalLightFront.position.set(0,5,5);
        this.scene.add( this.directionalLightFront );
        this.directionalLightBack = new THREE.DirectionalLight( 0xffffff, 1);
         this.directionalLightBack.position.set(0,5,-5);
        this.scene.add( this.directionalLightBack );
//         this.helper = new THREE.CameraHelper(this.directionalLightFront.shadow.camera)
// this.scene.add(this.helper )
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.delta = clock.getDelta();
        if (mixer) {
            mixer.update(this.delta);
        }
        if(mixerBox){
            mixerBox.update(this.delta);
        }
        this.controls.update();
        this.renderer.render(this.scene, this.cameraMain);
    }
    render() {
        this.animate();
    }
}

const onWindowResize=()=> {
    init.cameraMain.aspect = init.container.offsetWidth / init.container.offsetHeight;
    init.renderer.setSize(init.container.offsetWidth, init.container.offsetHeight);
    init.cameraMain.updateProjectionMatrix();
}

window.addEventListener('resize', onWindowResize, false);


class objLoad {
    constructor() {

    }
   
    Model() {
        this.loader = new GLTFLoader();
        Object.entries(anim).map(([key, value]) => {
            this.loader.load('assets/anims/' + value + '.glb', (value) => {
                animClips[key] = value.animations[0];
            })
        })
        this.loader.load('assets/spiderMan.glb', gltf => {            
            character = gltf.scene;
            character.scale.set(2, 2, 2);           
            mixer = new THREE.AnimationMixer(character);
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                  child.castShadow = true;
                }
             });
            init.scene.add(character);
        });
        this.loader.load('assets/box.glb' , gltf=>{
            boxAnim = gltf;
            box = gltf.scene;
            box.scale.set(2, 2, 2);            
            box.traverse((child)=>{
                if(child.isMesh){
                    child.castShadow = true;
                    if(child.name === 'Cover'){
                        child.material = new THREE.MeshPhongMaterial({
                            envMap:refCube,
                            reflectivity: .4,
                            transparent: true,
                            opacity:.5,
                            combine: THREE.MixOperation,
                            side: THREE.DoubleSide
                        })
                    }
                }
            });
            // mixerBox = new THREE.AnimationMixer( box );
            // this.actionOne = mixerBox.clipAction(boxAnim.animations[0]);
            // this.actionOne.play();
            init.scene.add(box);
        });
    }
}
const openClose = (num) => {
    console.log(typeof(num));
    if(num === -1){
        box.visible = true;
    }       
    mixerBox = new THREE.AnimationMixer( box );
    const action = mixerBox.clipAction(boxAnim.animations[0]);
          action.reset();  
          action.timeScale = num;
          action.clampWhenFinished = true;
          action.loop = THREE.LoopOnce;
          action.play();
    mixerBox.addEventListener('finished',()=>{
        if(num === 1){
            box.visible = false;
        }       
        mixer = new THREE.AnimationMixer(character);
        let action = mixer.clipAction(animClips['idle']);
            action.fadeIn(.5);
            if(num === 1){
                action.play();
            }else{
                action.stop();
            }
            
    });
}
export const playAnimation = (data) => {
     if(data === "stop"){
        mixer = new THREE.AnimationMixer(character);
        let action = mixer.clipAction(animClips['idle']);
            action.fadeIn(.2);
            action.play();
    }
    else{
        if(data === "hi" || data === "hello"){
            mixer = new THREE.AnimationMixer(character);
            let action = mixer.clipAction(animClips['hi']);
                action.fadeIn(.5);
                action.play();
                action.loop = THREE.LoopOnce;
                mixer.addEventListener('finished',()=>{
                    mixer = new THREE.AnimationMixer(character);
                    let action = mixer.clipAction(animClips["idle"]);
                    action.fadeIn(.3);
                    action.play();
                });
        }else{
            mixer = new THREE.AnimationMixer(character);
            let action = mixer.clipAction(animClips['yes']);
                action.fadeIn(.5);
                action.play();
                action.loop = THREE.LoopOnce;
                mixer.addEventListener('finished',()=>{
                    mixer = new THREE.AnimationMixer(character);
                    let action = mixer.clipAction(animClips[data]);
                    action.fadeIn(.3);
                    action.play();
                });
        }        
    }
    
}
