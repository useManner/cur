// js/main.js
import { initHandDetector, getLatestHand } from './hand-detector.js';
import { getPhotoUrls } from './photos.js';

let scene, camera, renderer;
let photoMeshes = [];
let selectedPhoto = null; // 当前被选中的照片
let originalPhotoPositions = []; // 存储照片初始位置

const RAYCASTER_DISTANCE = 50; // 射线检测距离

// 初始化 Three.js 场景
function initThreeJs() {
    const container = document.getElementById('threeJsContainer');

    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510); // 深色背景

    // 摄像机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 光源
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // 环境光
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);

    // 加载并创建照片网格
    loadPhotos();

    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);
}

// 加载照片并创建 Three.js 网格
function loadPhotos() {
    const loader = new THREE.TextureLoader();
    const urls = getPhotoUrls();
    const photoWidth = 2, photoHeight = 1.5; // 照片尺寸

    // 简单的网格布局
    const numCols = 3;
    const spacingX = photoWidth * 1.5;
    const spacingY = photoHeight * 1.5;

    urls.forEach((url, index) => {
        loader.load(url, (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const geometry = new THREE.PlaneGeometry(photoWidth, photoHeight);
            const mesh = new THREE.Mesh(geometry, material);

            // 计算照片在墙上的初始位置
            const col = index % numCols;
            const row = Math.floor(index / numCols);
            mesh.position.x = (col - Math.floor(numCols / 2)) * spacingX;
            mesh.position.y = (row - Math.floor(urls.length / numCols / 2)) * spacingY;
            mesh.position.z = 0;

            originalPhotoPositions.push(mesh.position.clone()); // 存储初始位置
            photoMeshes.push(mesh);
            scene.add(mesh);
        });
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 处理手势逻辑
function handleGestures() {
    const hand = getLatestHand();
    if (!hand) {
        // 如果没有手部识别，且有选中的照片，则将其归位
        if (selectedPhoto) {
            resetSelectedPhoto();
        }
        return;
    }

    // 将手部关键点从视频坐标转换到 Three.js 场景坐标
    // 假设视频画布是全屏的，这里需要进行比例转换
    const pointerX = (hand.landmarks[8][0] / window.innerWidth) * 2 - 1; // 食指尖 X
    const pointerY = -(hand.landmarks[8][1] / window.innerHeight) * 2 + 1; // 食指尖 Y

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(pointerX, pointerY), camera);

    const intersects = raycaster.intersectObjects(photoMeshes, true);

    // --- 1. 抽取/选择 (剪刀手指向) ---
    // 简化: 任何指向都会选中，这里需要添加剪刀手识别逻辑
    if (!selectedPhoto && intersects.length > 0 && intersects[0].object.type === 'Mesh') {
        selectedPhoto = intersects[0].object;
        // 动画到屏幕中央
        new TWEEN.Tween(selectedPhoto.position)
            .to({ x: 0, y: 0, z: camera.position.z - 2 }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        // 其他量子效果：叠加态的选取
        applySuperpositionEffect(selectedPhoto); // 模拟叠加态
    }

    // --- 2. 放大/缩小 (捏合手势) ---
    if (selectedPhoto) {
        // 计算食指尖和拇指尖的距离 (用于捏合手势)
        const thumbTip = hand.landmarks[4];
        const indexTip = hand.landmarks[8];
        const pinchDistance = Math.sqrt(
            Math.pow(thumbTip[0] - indexTip[0], 2) +
            Math.pow(thumbTip[1] - indexTip[1], 2)
        );

        // 将捏合距离映射到缩放比例
        // 需要根据实际摄像头和手部距离进行调整，这里是示例值
        const minPinchDist = 20; // 最小捏合距离 (手合拢)
        const maxPinchDist = 150; // 最大捏合距离 (手张开)
        let scaleFactor = THREE.MathUtils.mapLinear(pinchDistance, minPinchDist, maxPinchDist, 0.5, 3.0);
        scaleFactor = THREE.MathUtils.clamp(scaleFactor, 0.5, 3.0); // 限制缩放范围

        selectedPhoto.scale.set(scaleFactor, scaleFactor, 1);

        // 量子效果：不确定性缩放
        applyUncertaintyScaling(selectedPhoto, scaleFactor);
    }
}

// 将选中的照片归位
function resetSelectedPhoto() {
    if (selectedPhoto) {
        const originalPosIndex = photoMeshes.indexOf(selectedPhoto);
        if (originalPosIndex !== -1) {
            // 量子效果：量子隧穿归位
            applyQuantumTunnelingReturn(selectedPhoto, originalPhotoPositions[originalPosIndex].clone(), () => {
                selectedPhoto.scale.set(1, 1, 1); // 恢复原始大小
                selectedPhoto = null;
                // 清除叠加态效果
                clearSuperpositionEffect();
            });
        }
    }
}

// ----------------------------------------------------
// 量子效果实现 (占位函数，后续填充具体 Three.js 动画/着色器)
// ----------------------------------------------------

// 效果一：叠加态的选取
function applySuperpositionEffect(selectedMesh) {
    // 围绕 selectedMesh 的照片变得半透明，或有特殊光晕
    // 假设在 selectedMesh 附近的照片都受到影响
    photoMeshes.forEach(mesh => {
        if (mesh !== selectedMesh) {
            const distance = mesh.position.distanceTo(selectedMesh.position);
            if (distance < 5) { // 附近的照片
                // 暂时修改材质，使其半透明
                mesh.material.transparent = true;
                mesh.material.opacity = 0.3;
                // 或者添加一个半透明的平面作为覆盖物
                // 也可以用着色器实现更复杂的视觉效果
            }
        }
    });
}

function clearSuperpositionEffect() {
    photoMeshes.forEach(mesh => {
        mesh.material.opacity = 1.0;
        mesh.material.transparent = false;
        // 移除其他叠加态视觉元素
    });
}

// 效果二：不确定性缩放
function applyUncertaintyScaling(mesh, scaleFactor) {
    // 当 scaleFactor 越大，抖动越明显
    const maxJitter = 0.05; // 最大抖动范围
    const jitterAmount = (scaleFactor - 0.5) / 2.5 * maxJitter; // 映射抖动量

    if (jitterAmount > 0) {
        mesh.position.x += (Math.random() - 0.5) * jitterAmount * 2;
        mesh.position.y += (Math.random() - 0.5) * jitterAmount * 2;
        // 注意：这里需要确保抖动是围绕当前位置的，而不是每次都累加
        // 更好的做法是存储一个基准位置，然后在其上加抖动
    }
}

// 效果三：量子隧穿归位
function applyQuantumTunnelingReturn(mesh, targetPosition, onCompleteCallback) {
    // 1. 照片溶解成粒子
    // 2. 粒子移动到目标位置
    // 3. 粒子重新凝结成照片

    // 简单实现：快速淡出，移动，然后淡入
    new TWEEN.Tween(mesh.material)
        .to({ opacity: 0 }, 200)
        .onComplete(() => {
            mesh.position.copy(targetPosition); // 直接瞬移到目标位置
            new TWEEN.Tween(mesh.material)
                .to({ opacity: 1 }, 200)
                .onComplete(onCompleteCallback)
                .start();
        })
        .start();
    mesh.material.transparent = true; // 启用透明度
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    handleGestures(); // 处理手势
    TWEEN.update(); // 更新 tween 动画

    renderer.render(scene, camera);
}

// 启动函数
async function startApp() {
    await initHandDetector();
    initThreeJs();
    animate();
}

startApp();