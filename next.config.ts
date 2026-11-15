import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 이미지용: 실행에 필요한 파일만 .next/standalone 에 모은다 (Dockerfile)
  output: "standalone",
  // 개발 모드 표시("N")가 사이드바 계정 메뉴·패널 저장 버튼 같은 모서리 버튼을 가려서 끈다.
  // 오류가 나면 뜨는 오류 화면은 그대로 나온다.
  devIndicators: false,
  experimental: {
    // proxy(src/proxy.ts)를 거치는 요청 본문은 이 크기까지만 메모리에 담고 나머지는 잘린다 (기본 10MB).
    // 워크플로우 파일 올리기(/api/backend/files)가 음원·영상을 받으므로 백엔드 한도(FILES_MAX_MB=200)보다 조금 크게 둔다.
    proxyClientMaxBodySize: "210mb",
  },
};

export default nextConfig;
