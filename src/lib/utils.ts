import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}${path}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function constructMetaData({
  title = "QueryQuill - the SaaS for student",
  description = "Query quill is an open source software to make chatting to your PDF files easy.",
  image = "/thumbnail.png",
  icons = "/favicon.png",
  noIndex = false,
}: {
  title?: string;   
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: { 
      title,
      description,
      images : [
        {url : image}
      ],

    },
    twitter : {
      card : "summary_large_image",
      title,
      description,
      images:[image],
      creator: "@TejasTh371168321"
    },
    icons ,
    metadataBase : new URL ("https://query-quill.vercel.app"),
    themeColor : "#FFF",
    ...(noIndex && {
       robots : {
        index : false,
        follow : false,
       }
    })

  };
}
