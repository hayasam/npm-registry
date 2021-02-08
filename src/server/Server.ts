export interface Server {
  start(callback?: () => void): Promise<void>;
  stop(callback?: () => void): Promise<void>;
}
