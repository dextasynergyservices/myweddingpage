declare module "unzipper" {
  // Minimal typings for the parts we use
  export function Extract(options: { path: string }): NodeJS.ReadWriteStream;
  export = unzipper;
}
