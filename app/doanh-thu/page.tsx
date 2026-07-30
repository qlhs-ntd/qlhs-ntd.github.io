import type { Metadata } from "next";
import { RevenueDashboard } from "../components/RevenueDashboard";

export const metadata: Metadata = {
  title: "Doanh Thu",
};

export default function RevenuePage() {
  return <RevenueDashboard />;
}
