# 헬짱(helzzang)

내 주변 헬스장을 쉽고 빠르게 찾고, 가격과 후기, 운동 정보를 한 곳에서 확인할 수 있는 **React Native 기반 헬스장 탐색 & 커뮤니티 앱**입니다.

이 README는 [**좋은 README 작성 가이드**](https://insight.infograb.net/blog/2023/08/23/good-readme/)를 참고해 작성되었습니다.

---

## 1. 프로젝트 소개

헬짱은 다음과 같은 문제를 해결하기 위해 만들어졌습니다.

- **내 주변에 어떤 헬스장이 있는지 한눈에 보기 어렵다.**
- **헬스장 가격 정보(특히 일일권)를 모아서 보기 힘들다.**
- **운동 관련 질문이나, 주변 헬스장 후기를 믿을 만한 사람들끼리 공유하기 어렵다.**

헬짱은 아래 기능을 통해 이런 문제를 해결합니다.

- 내 현재 위치 기준으로 **주변 헬스장 목록**을 조회
- 헬스장별 **일일권 가격 정보 노출** (운동닥터 API에 가격 데이터가 없을 경우, 합리적인 범위의 **임의 가격을 표시**)
- **커뮤니티 게시글 & 댓글**을 통해 운동 Q&A, 헬스장 후기 공유
- **Google 로그인 사용자만** 커뮤니티 글/댓글 작성 및 수정·삭제 가능

---

## 2. 주요 기능

- **주변 헬스장 탐색**

  - `운동닥터` 앱의 API를 사용해 **주변 헬스장 목록과 기본 정보**를 가져옵니다.
  - 사용자의 현재 위치(위도/경도)를 기준으로 가까운 헬스장을 정렬해 보여줍니다.

- **헬스장 가격 정보**

  - API로 일일권 가격을 받아오면 그대로 노출합니다.
  - **일일권 가격 데이터가 없을 경우**, 앱 내부에서 정의한 **임의의 가격**을 표시해 사용자가 대략적인 가격 수준을 가늠할 수 있도록 합니다.

- **커뮤니티 (게시글 & 댓글)**

  - **Google 로그인한 사용자만** 게시글과 댓글을 작성할 수 있습니다.
  - 게시글/댓글 작성자는 **본인이 작성한 글만 수정·삭제**할 수 있습니다.
  - 주변 헬스장 후기, 운동 루틴, 장비 추천 등 다양한 내용을 자유롭게 공유할 수 있습니다.

- **인증 및 데이터 저장**
  - 인증 및 커뮤니티 데이터(게시글, 댓글)는 **Supabase**를 사용해 관리합니다.
  - 클라이언트에서는 `@supabase/supabase-js`와 커스텀 훅(`useSupabaseAuth`, `useCommunityPosts`, `useCommunityComments` 등)을 통해 구현되어 있습니다.

---

## 3. 스크린샷

### 3-1. 헬스장 목록 화면

```md
![Gym List Screen](assets/images/readme/gym-list.png)
```

### 3-2. 헬스장 상세 / 가격 정보

```md
![Gym Detail Screen](assets/images/readme/gym-detail.png)
```

### 3-3. 커뮤니티 목록 화면

```md
![Community Screen](assets/images/readme/community-list.png)
```

### 3-4. 커뮤니티 글쓰기 & 댓글

```md
![Community Write Screen](assets/images/readme/community-write.png)
![Community Comment Screen](assets/images/readme/community-comment.png)
```

> 필요하다면 AI 비교 화면, 로그인 화면 등도 같은 폴더 내 이미지를 추가로 연결하면 됩니다.

---

## 4. 사전 요구사항

이 프로젝트를 로컬에서 실행하기 위해서는 다음 환경이 필요합니다.

- **Node.js**: `>= 20`
- **패키지 매니저**: Bun
- **React Native 개발 환경 설정**
  - Xcode & CocoaPods (iOS 빌드용, macOS 환경)
  - 자세한 내용은 React Native 공식 문서의 [환경 설정 가이드](https://reactnative.dev/docs/environment-setup)를 참고하세요.

또한 다음 외부 서비스/환경 변수가 필요합니다.

- **Supabase**
  - Google OAuth 및 커뮤니티 데이터 저장에 사용합니다.
  - 다음과 같은 환경 변수를 설정해야 합니다. (예시)
    - `SUPABASE_URL`
    - `SUPABASE_ANON_KEY`
    - (선택) `GOOGLE_CLIENT_ID` 등

---

## 5. 설치 및 실행 방법

### 5-1. 의존성 설치

```sh
# 패키지 설치
bun install
```

### 5-2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고, Supabase 관련 키를 설정합니다.

```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

필요하다면 Google 로그인 관련 설정도 함께 추가합니다.

### 5-3. Metro 번들러 실행

```sh
bun start
```

### 5-4. Android 실행

```sh
bun run android
```

### 5-5. iOS 실행 (macOS)

처음 설정 시 혹은 네이티브 의존성 변경 시:

```sh
cd ios
bundle install
bundle exec pod install
cd ..
```

이후 iOS 앱 실행:

```sh
bun run ios
```

---

## 6. 사용 방법

1. **앱 실행 후 권한 허용**

   - 위치 권한을 허용하면 현재 위치를 기준으로 주변 헬스장 목록을 조회합니다.

2. **주변 헬스장 목록 확인**

   - `GymListScreen`에서 내 주변 헬스장 리스트를 확인할 수 있습니다.
   - 위치 권한을 허용하지 않으면 기본 위치(강남역)을 기준으로 주변 헬스장 목록을 조회합니다.
   <!-- - 각 헬스장을 선택하면 상세 정보 및 일일권 가격(또는 임의 가격)을 볼 수 있습니다. -->

3. **Google 로그인**

   - 커뮤니티 기능을 사용하려면 Google 계정으로 로그인해야 합니다.
   - 로그인 상태는 Supabase 인증을 통해 관리됩니다.

4. **커뮤니티 글쓰기**

   - `CommunityWriteScreen`에서 운동 질문, 헬스장 후기 등을 작성할 수 있습니다.
   - 작성된 글은 커뮤니티 목록 화면에서 확인할 수 있습니다.

5. **댓글 작성 & 관리**
   - 게시글 상세 화면에서 댓글을 작성하여 질의응답을 이어갈 수 있습니다.
   - 게시글/댓글 작성자는 자신의 글만 수정하거나 삭제할 수 있습니다.

---

## 7. 자주 발생할 수 있는 문제 & 해결 방법

- **빌드/실행 시 네트워크 관련 에러**

  - `.env` 파일에 운동닥터 API, Supabase 관련 환경 변수가 제대로 설정되어 있는지 확인합니다.
  - Android 에뮬레이터/실기기에서 네트워크 권한이 허용되어 있는지 확인합니다.

- **주변 헬스장 목록이 보이지 않는 경우**

  - 위치 권한이 허용되었는지 확인합니다.
  - 위치가 한국 내에 있는지 확인합니다.

- **커뮤니티 글/댓글 작성이 되지 않는 경우**
  - Google 로그인이 완료되었는지 확인합니다.
  - Supabase 설정(SUPABASE_URL, SUPABASE_ANON_KEY)이 올바른지 확인합니다.

---


## 8. 참고 자료

- [좋은 README 작성하는 방법 (InfoGrab 블로그)](https://insight.infograb.net/blog/2023/08/23/good-readme/)
- [React Native 공식 문서](https://reactnative.dev)
- [Supabase 공식 문서](https://supabase.com/docs)
