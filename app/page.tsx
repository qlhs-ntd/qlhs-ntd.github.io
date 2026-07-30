import type { Metadata } from "next";
import { ProfileManager } from "./components/ProfileManager";

export const metadata: Metadata = {
  title: "Hồ Sơ | QLHS",
};

export default function HomePage() {
  return <ProfileManager />;
}
