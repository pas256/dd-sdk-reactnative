RELEASE_TEST_APP_NAME = ReleaseTestApp
REACT_NATIVE_VERSION := $(shell node --eval="require('./example/package.json').dependencies['react-native']" -p)
CORE_PACKAGE_VERSION := $(shell node --eval="require('./packages/core/package.json').version" -p)

define ReleaseTestAppPodfile
require_relative '../node_modules/react-native/scripts/react_native_pods'\n
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'\n
platform :ios, '11.0'\n
use_frameworks!\n
target '${RELEASE_TEST_APP_NAME}' do\n
  config = use_native_modules!\n
  use_react_native!(:path => config["reactNativePath"])\n
  target '${RELEASE_TEST_APP_NAME}Tests' do\n
    inherit! :complete\n
  end\n
end\n
target '${RELEASE_TEST_APP_NAME}-tvOS' do\n
  target '${RELEASE_TEST_APP_NAME}-tvOSTests' do\n
    inherit! :search_paths\n
  end\n
end\n
endef
export ReleaseTestAppPodfile

define SDKUsageJavascript
import { DdSdkReactNativeConfiguration, DdSdkReactNative, DdLogs, DdRum } from '@datadog/react-native-sdk';\n
const config = new DdSdkReactNativeConfiguration("token", "env", "appID");\n
DdSdkReactNative.initialize(config).then(() => {\n
  console.log("DD running...");\n
  DdRum.startView('first', 'App', Date.now(), {});\n
  DdLogs.info('This is a log sent from react-native', {\n
    foo: 42,\n
    bar: 'xyz',\n
  });\n
});\n
endef
export SDKUsageJavascript

test-for-release:
	yarn install && yarn workspace @datadog/react-native-sdk pack
	npx react-native init ${RELEASE_TEST_APP_NAME} --version ${REACT_NATIVE_VERSION}
	cd ${RELEASE_TEST_APP_NAME} && npm install --save ../packages/core/datadog-react-native-sdk-v${CORE_PACKAGE_VERSION}.tgz
	# write to Podfile
	echo $$ReleaseTestAppPodfile > ${RELEASE_TEST_APP_NAME}/ios/Podfile
	# append to App.js
	echo $$SDKUsageJavascript >> ${RELEASE_TEST_APP_NAME}/App.js
	cd ${RELEASE_TEST_APP_NAME}/ios && pod install
	cd ${RELEASE_TEST_APP_NAME} && npx react-native run-ios