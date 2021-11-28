export {}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_CLIENT_ID: string
      REACT_APP_CLIENT_SECRET: string
    }
  }
  interface Window {
    localforage: LocalForage
  }
}
