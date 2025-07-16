export type PageParams<T extends string = string> = {
  params: Record<T, string>;
};
