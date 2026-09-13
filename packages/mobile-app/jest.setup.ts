// jest.setup.ts — mocks globales de módulos nativos, per unit-test-instructions.md § Mocking/stubbing.
// Todas las pruebas corren en Node (jsdom vía jest-expo), sin simulador/dispositivo real.
import "@testing-library/jest-native/extend-expect";

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    __store: store,
  };
});

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock("expo-notifications", () => ({
  setBadgeCountAsync: jest.fn(async () => true),
  getBadgeCountAsync: jest.fn(async () => 0),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  setNotificationHandler: jest.fn(),
}));

jest.mock("expo-sqlite", () => require("./src/shared/__fixtures__/expoSqliteMock").expoSqliteMock);

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        apiBaseUrl: "https://api-test.calculadora-comisiones.local",
      },
    },
  },
}));
