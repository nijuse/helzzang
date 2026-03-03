import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Helzzang",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // 구글 로그인 등 OAuth 콜백: helzzang://auth/callback?code=... 로 앱이 열릴 때
  // 이 메서드가 없으면 URL이 React Native Linking으로 전달되지 않아 getInitialURL/url 이벤트가 동작하지 않음
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    let url = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    // Metro가 아직 준비되지 않았을 때 fallback (localhost:8081)
    if url == nil, let fallback = URL(string: "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false") {
      return fallback
    }
    return url
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
