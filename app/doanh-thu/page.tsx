import type { Metadata } from "next";
import { RevenueDashboard } from "../components/RevenueDashboard";

export const metadata: Metadata = {
  title: "Doanh thu 2026",
};

export default function RevenuePage() {
  return <RevenueDashboard />;
}
