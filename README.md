# GitHub Pages Blog

나만의 애플 감성 블로그 🍎

## 파일 구조

```
blog/
├── index.html      ← 메인 페이지
├── post.html       ← 글 상세 페이지 (예시)
├── style.css       ← 전체 스타일
├── main.js         ← 인터랙션 (다크모드, 태그필터 등)
├── hero_bg.jpg     ← 히어로 배경 이미지
└── README.md       ← 이 파일
```

## 새 글 추가하는 법

1. `post.html`을 복사해서 새 파일 만들기 (예: `my-new-post.html`)
2. 제목, 내용, 날짜 수정
3. `index.html`의 포스트 그리드에 카드 추가
4. `git push` → 자동 배포!

## 배포

```bash
git add .
git commit -m "새 글: 글 제목"
git push origin main
```

## 기능

- 🌙 다크모드 지원 (로컬스토리지 저장)
- 🏷️ 태그 필터링
- 📖 읽기 진행률 바 (글 페이지)
- ✨ 스크롤 애니메이션
- 📱 반응형 디자인
