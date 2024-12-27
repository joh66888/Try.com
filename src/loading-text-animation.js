import { gsap } from 'gsap';

// 更新 loading text 使用 GSAP 滾動動畫
export function updateLoadingText(progressRatio, loadingtext) {
    let newText = Math.floor(progressRatio * 100);

    gsap.to(loadingtext, {
        duration: 4,
        innerHTML: newText,
        snap: { innerHTML: 1 },
        ease: 'power2.out',
        onUpdate: function () {
            // 當進度等於 100 時觸發淡出動畫並清空 DOM 元素內容
            if (parseInt(newText) === 100) {
                gsap.to(loadingtext, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        loadingtext.classList.add('ended');
                        loadingtext.innerHTML = ``;
                    },
                });
            } else {
                // 當進度不等於 100 時更新 DOM 元素內容
                loadingtext.innerHTML = newText;
            }
        }
    });
}