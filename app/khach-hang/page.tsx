import type { Metadata } from "next";
import { RevenueDashboard } from "../components/RevenueDashboard";

export const metadata: Metadata = {
  title: "Khách Hàng",
};

export default function CustomerPage() {
  return <RevenueDashboard customerMode />;
}
