import type { Metadata } from "next";
import { ProfileManager } from "./components/ProfileManager";

export const metadata: Metadata = {
  title: "Danh sách hồ sơ xe 2026",
};

export default function HomePage() {
  return <ProfileManager />;
}
