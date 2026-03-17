// js/hand-detector.js

const video = document.getElementById('webcamVideo');
const gestureCanvas = document.getElementById('gestureCanvas');
const gestureCtx = gestureCanvas.getContext('2d');

let handposeModel;
let latestHand = null; // 存储最新识别到的手部关键点

async function setupWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
    } catch (error) {
        console.error("无法访问摄像头:", error);
        alert("请允许访问摄像头以使用手势控制。");
    }
}

async function loadHandposeModel() {
    console.log("正在加载 Handpose 模型...");
    handposeModel = await handpose.load();
    console.log("Handpose 模型加载完成。");
}

async function detectHands() {
    if (!handposeModel || !video.readyState === video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detectHands);
        return;
    }

    const predictions = await handposeModel.estimateHands(video);
    latestHand = predictions.length > 0 ? predictions[0] : null; // 获取第一只手

    // 可选: 在 gestureCanvas 上绘制手部关键点 (用于调试)
    // if (latestHand) {
    //     gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
    //     gestureCtx.drawImage(video, 0, 0, gestureCanvas.width, gestureCanvas.height);
    //     for (let i = 0; i < latestHand.landmarks.length; i++) {
    //         const x = latestHand.landmarks[i][0];
    //         const y = latestHand.landmarks[i][1];
    //         gestureCtx.beginPath();
    //         gestureCtx.arc(x, y, 5, 0, 2 * Math.PI);
    //         gestureCtx.fillStyle = 'red';
    //         gestureCtx.fill();
    //     }
    // }

    requestAnimationFrame(detectHands);
}

// 导出方法供 main.js 调用
export async function initHandDetector() {
    await setupWebcam();
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    gestureCanvas.width = video.videoWidth;
    gestureCanvas.height = video.videoHeight;
    await loadHandposeModel();
    detectHands(); // 开始检测
}

export function getLatestHand() {
    return latestHand;
}