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

*최종 업데이트: 2025년 2월 (React Native 0.82 기준)*
