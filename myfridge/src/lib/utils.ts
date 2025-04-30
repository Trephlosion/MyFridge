import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// Formats a Date into something like "Apr 29, 2025 at 5:30 PM"
export function formatDateString(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

// Smart formatting for "Just now", "5 minutes ago", "Apr 29, 2025"
export const multiFormatDateString = (input?: any): string => {
  if (!input) return "Unknown Date";

  let date: Date;

  // Handle different input types
  if (input instanceof Date) {
    date = input;
  } else if (typeof input.toDate === "function") {
    // Firestore Timestamp
    date = input.toDate();
  } else if (typeof input === "string") {
    date = new Date(input);
  } else {
    return "Invalid Date";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = diffMs / 1000;
  const diffMinutes = diffSeconds / 60;
  const diffHours = diffMinutes / 60;
  const diffDays = diffHours / 24;

  switch (true) {
    case diffDays >= 30:
      return formatDateString(date);
    case diffDays >= 2:
      return `${Math.floor(diffDays)} days ago`;
    case diffDays >= 1:
      return `Yesterday`;
    case diffHours >= 1:
      return `${Math.floor(diffHours)} hours ago`;
    case diffMinutes >= 1:
      return `${Math.floor(diffMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};
