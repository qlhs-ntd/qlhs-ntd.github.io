import type { Metadata } from "next";
import { AuthForm } from "../components/AuthForm";

export const metadata: Metadata = {
  title: "Đăng Nhập",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return <AuthForm />;
}
