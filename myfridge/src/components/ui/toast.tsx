import { toast as hotToast } from "react-hot-toast";

type ToastProps = {
    title: string;
    description?: string;
    type?: "success" | "error" | "info" | "loading";
    duration?: number;
};

/**
 * Custom Toast Function
 * @param {string} title - The main title of the toast
 * @param {string} [description] - Optional description text
 * @param {"success" | "error" | "info" | "loading"} [type="info"] - Type of toast message
 * @param {number} [duration=3000] - Duration in milliseconds (default 3 seconds)
 */
export function toast({ title, description, type = "info", duration = 3000 }: ToastProps) {
    switch (type) {
        case "success":
            hotToast.success(title, { duration });
            break;
        case "error":
            hotToast.error(title, { duration });
            break;
        case "loading":
            hotToast.loading(title, { duration });
            break;
        default:
            hotToast(title, { duration });
    }
}
