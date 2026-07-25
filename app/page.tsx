import type { Metadata } from "next";
import { ProfileManager } from "./components/ProfileManager";

export const metadata: Metadata = {
  title: "QLHS - Dũng Nguyễn",
};

export default function HomePage() {
  return <ProfileManager />;
}
