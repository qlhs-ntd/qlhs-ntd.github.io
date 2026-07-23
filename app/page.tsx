import type { Metadata } from "next";
import { ProfileManager } from "./components/ProfileManager";

export const metadata: Metadata = {
  title: "Tổng hợp hồ sơ",
};

export default function HomePage() {
  return <ProfileManager />;
}
