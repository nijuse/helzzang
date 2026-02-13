# iOS 빌드 에러 해결 과정 (React Native 0.82)

이 문서는 helzzang 프로젝트에서 겪었던 iOS 빌드 관련 에러와 해결 절차를 정리한 것입니다.

---

## 1. NativeMicrotasksCxx TurboModule을 찾을 수 없음

**증상**
- 앱 실행 시 빨간 화면: `TurboModuleRegistry.getEnforcing(...): 'NativeMicrotasksCxx' could not be found`
- 네이티브 모듈이 바이너리에 등록되지 않았다는 메시지

**해결**
- iOS 네이티브 쪽을 초기화하고 CocoaPods 재설치
- 터미널 인코딩 이슈 방지를 위해 UTF-8 설정 후 실행

```bash
cd ios
rm -rf build Pods Podfile.lock
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
pod install
```

---

## 2. Xcode Clean 시 "PIF transfer session" 오류

**증상**
- Product → Clean Build Folder 시 실패
- `Could not compute dependency graph: unable to initiate PIF transfer session (operation in progress?)`

**해결**
1. **Xcode 완전 종료**
2. **DerivedData 삭제** (터미널):
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/helzzang-*
   ```
3. **프로젝트 내 ios 빌드 폴더 삭제** (선택):
   ```bash
   rm -rf ios/build
   ```
4. Xcode 다시 실행 후 Clean Build Folder (⇧⌘K)

※ `ios/build`를 지우면 아래 3번 문제가 발생할 수 있으므로, Clean만 필요할 때는 **DerivedData만 지우고** `ios/build`는 유지하는 것을 권장합니다.

---

## 3. 빌드 시 "Build input file cannot be found" (codegen 파일 누락)

**증상**
- ReactCodegen 관련 다수 오류
- `ios/build/generated/ios/` 아래 `.mm`, `.cpp` 파일을 찾을 수 없음
- 예: `RCTThirdPartyComponentsProvider.mm`, `RNVectorIconsSpec-generated.mm`, `safeareacontext-generated.mm` 등

**원인**
- `ios/build` 폴더를 삭제해서 **codegen으로 생성된 파일들이 사라진 경우**

**해결**
- codegen이 다시 실행되도록 `pod install` 한 번 더 실행

```bash
cd ios
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
pod install
```

이후 Xcode에서 Product → Build (⌘B) 또는 Run (⌘R).

---

## 요약 체크리스트

| 상황 | 할 일 |
|------|--------|
| NativeMicrotasksCxx 등 TurboModule 오류 | `ios`에서 `rm -rf build Pods Podfile.lock` 후 `pod install` (UTF-8 설정) |
| Xcode Clean 실패 (PIF 오류) | Xcode 종료 → DerivedData 삭제 → Xcode 재실행 후 Clean |
| codegen 파일 없어서 빌드 실패 | `ios`에서 `pod install`만 다시 실행 (ios/build 지우지 말 것) |
| 앞으로 Clean 할 때 | **Product → Clean Build Folder**만 사용. `ios/build` 수동 삭제는 피하기 |

---

## 4. Xcode 빌드는 성공하는데 시뮬레이터에서만 NativeMicrotasksCxx 등 에러

**증상**
- Xcode에서 Build/Run은 성공
- `bun start ios --reset-cache` 등으로 실행하면 시뮬레이터에서 TurboModule 에러

**원인**
- 시뮬레이터에 **예전에 설치된 앱**이 그대로 있어서, 새 네이티브 빌드가 아니라 옛날 바이너리가 실행되는 경우

**해결**
1. 시뮬레이터에서 **helzzang 앱 삭제** (앱 아이콘 길게 누르기 → 앱 제거)
2. Metro: `bun start --reset-cache`
3. 앱 실행: **Xcode에서 Product → Run** (⌘R)

---

## 5. AI API 네트워크 에러 (Info.plist 수정 후 반영 안 됨)

**증상**
- AI API 호출 시 네트워크 에러 발생
- `Info.plist`에서 `NSAppTransportSecurity` 수정(API 도메인 예외 추가 등)을 했음에도 앱에서 계속 네트워크 에러

**원인**
- `Info.plist` 수정이 빌드 캐시 때문에 실제 앱에 반영되지 않음
- `pod install`이나 일반적인 Clean & Rebuild만으로는 Xcode/시뮬레이터의 캐시가 완전히 갱신되지 않는 경우

**시도했지만 해결되지 않았던 방법**
- `pod install` 반복 실행
- 일반적인 Clean & Rebuild

**해결 절차** (아래 순서대로 진행)

1. **CocoaPods 캐시 완전 삭제**
   ```bash
   pod cache clean --all
   ```

2. **Derived Data 삭제**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/helzzang-*
   ```

3. **Xcode 완전 종료** 후 다시 실행

4. **Xcode에서 Clean Build Folder** (⇧⌘K)

5. **재빌드 및 앱 실행**

6. **Metro 번들러 재시작**
   ```bash
   bun start --reset-cache
   ```

**Info.plist 관련 참고**
- 이 프로젝트에서는 AI API 호출을 위해 `NSAppTransportSecurity` 아래에 다음 도메인 예외가 설정됨:
  - `generativelanguage.googleapis.com`
  - `api.tavily.com`
  - `api.groq.com`
- `Info.plist`를 수정한 뒤에는 위와 같이 **캐시 삭제 → Derived Data 삭제 → Xcode Clean → 재빌드 → Metro 재시작**까지 진행해야 변경 사항이 반영됨.

---

## 6. [runtime not ready] Global was not installed (AppRegistryBinding::startSurface failed)

**증상**
- 앱 실행 시 빨간 화면: `[runtime not ready]: Error: Non-js exception: AppRegistryBinding::startSurface failed. Global was not installed.`
- JS 번들이 완전히 로드되기 전에 네이티브가 화면을 띄우려다 실패하는 경우

**원인**
- Metro/Hermes 캐시 문제 또는 이전 빌드 잔여물
- New Architecture(React Native 0.82) 환경에서 가끔 발생

**해결 절차** (순서대로 진행)

1. **Metro 종료**  
   실행 중인 `bun start` / `npm start` 터미널에서 Ctrl+C

2. **Metro·Watchman 캐시 삭제**
   ```bash
   cd /Users/pn090/Desktop/01_source/helzzang
   rm -rf node_modules/.cache
   watchman watch-del-all 2>/dev/null || true
   bun start --reset-cache
   ```
   (Metro는 여기서 **띄워 둔 채** 다음 단계 진행)

3. **다른 터미널에서 iOS 클린 빌드**
   ```bash
   cd /Users/pn090/Desktop/01_source/helzzang/ios
   rm -rf build Pods Podfile.lock
   export LANG=en_US.UTF-8
   export LC_ALL=en_US.UTF-8
   pod install
   ```

4. **Xcode DerivedData 삭제 후 재빌드**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/helzzang-*
   ```
   그 다음 **Xcode**에서 프로젝트 열고 Product → Clean Build Folder (⇧⌘K) 후 Run (⌘R).

5. **시뮬레이터에 예전 앱이 있으면 삭제**  
   시뮬레이터에서 helzzang 앱 아이콘 길게 누르기 → 앱 제거 후, Xcode에서 다시 Run.

**그래도 안 되면**
- Metro 터미널에서 **JS 쪽 에러 로그**가 먼저 찍혔는지 확인 (번들 로딩 중 예외가 나면 이 오류로 이어질 수 있음).
- 일시적으로 New Architecture 끄기: `ios/helzzang/Info.plist`에서 `RCTNewArchEnabled`를 `false`로 바꾼 뒤 위 3~5단계 다시 진행.

---

*최종 업데이트: 2025년 2월 (React Native 0.82 기준)*
