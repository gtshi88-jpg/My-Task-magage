import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Task Magage",
    short_name: "Task Magage",
    description: "タスクを管理できるカンバンアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/bg-app.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/task-management.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
    ],
  };
}
