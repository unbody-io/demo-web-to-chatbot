import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5)
}


export function formatUrl(url: string) {
  const cleanUrl = url.replace(/^https?:\/\//, "")
  const pagePath = cleanUrl.split("/")[1].toLowerCase().trim().replace(/\//g, "").replace(/\s+/g, "-");

  console.log("pagePath", pagePath);

  if(pagePath === "" || pagePath === "index" || pagePath === "/") {
    return "Homepage"
  }


  return `/${pagePath}`;
}

export function displayUrl(link: string) {
  try {
    const urlObj = new URL(link)

    // If there's a path (beyond just "/"), show it, otherwise show domain
    if (urlObj.pathname && urlObj.pathname !== "/") {
      // Clip path to max 30 chars
      const path = urlObj.pathname.length > 30 ? urlObj.pathname.substring(0, 27) + "..." : urlObj.pathname
      return path
    }

    // No path, return domain
    return urlObj.hostname
  } catch {
    // Invalid URL, return as is but clipped
    return link.length > 30 ? link.substring(0, 27) + "..." : link
  }
}