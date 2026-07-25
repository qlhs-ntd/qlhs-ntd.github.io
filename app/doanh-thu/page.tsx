import type { Metadata } from "next";
import { RevenueDashboard } from "../components/RevenueDashboard";

export const metadata: Metadata = {
  title: "QLHS - Dũng Nguyễn",
};

export default function RevenuePage() {
  return <RevenueDashboard />;
}
