import type { Metadata } from "next";
import { ProfileManager } from "./components/ProfileManager";

export const metadata: Metadata = {
  title: "Danh sách hồ sơ",
};

export default function HomePage() {
  return <ProfileManager />;
}

