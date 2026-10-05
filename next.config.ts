import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 이미지용: 실행에 필요한 파일만 .next/standalone 에 모은다 (Dockerfile)
  output: "standalone",
  // 개발 모드 표시("N")가 사이드바 계정 메뉴·패널 저장 버튼 같은 모서리 버튼을 가려서 끈다.
  // 오류가 나면 뜨는 오류 화면은 그대로 나온다.
  devIndicators: false,
};

export default nextConfig;
