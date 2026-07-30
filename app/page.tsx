import type { Metadata } from "next";
import { ProfileManager } from "./components/ProfileManager";

export const metadata: Metadata = {
  title: "Dũng - QLHS",
};

export default function HomePage() {
  return <ProfileManager />;
}
