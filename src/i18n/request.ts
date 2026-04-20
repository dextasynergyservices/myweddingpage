import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE_NAME, DEFAULT_LOCALE } from "@/config/i18n";

// The params shape provided to getRequestConfig can vary between versions.
// Use a loose any here to avoid type incompatibilities in this workspace.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default getRequestConfig(async (params: any) => {
  const headers = params?.headers;
  const cookieHeader = headers?.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]+)`));
  const locale = match ? decodeURIComponent(match[1]) : DEFAULT_LOCALE;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
