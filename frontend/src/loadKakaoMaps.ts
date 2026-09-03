// 카카오맵 JS SDK를 한 번만 로드해서 재사용함 (여러 컴포넌트가 동시에 불러도 스크립트가 중복 삽입되지 않게)
declare global {
  interface Window {
    kakao: any;
  }
}

let loadPromise: Promise<any> | null = null;

export function loadKakaoMaps(): Promise<any> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve(window.kakao);
      return;
    }

    const appKey = import.meta.env.VITE_KAKAO_JS_KEY;
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => reject(new Error('카카오맵 SDK를 불러오지 못했어요.'));
    document.head.appendChild(script);
  });

  return loadPromise;
}
