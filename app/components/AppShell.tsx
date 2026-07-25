"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import styled from "styled-components";

const Shell = styled.div`
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  display: flex;
  width: 84px;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.88);
  padding: 28px 14px 22px;
  backdrop-filter: blur(18px);

  @media (max-width: 860px) {
    inset: auto auto max(14px, env(safe-area-inset-bottom)) 50%;
    width: min(230px, calc(100vw - 28px));
    height: auto;
    border: 0.5px solid rgba(0, 0, 0, 0.06);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 4px;
    transform: translateX(-50%);

    body.profile-modal-open & {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }
  }
`;

const Navigation = styled.nav`
  display: grid;
  gap: 7px;
  width: 100%;

  @media (max-width: 860px) {
    display: flex;
    width: 100%;
    gap: 3px;
  }
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: 13px;
  padding: 0;
  background: ${({ $active }) => ($active ? "#edf0ff" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--primary)" : "#5f6779")};
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  transition: 150ms ease;

  span {
    display: none;
  }

  &::after {
    position: absolute;
    left: calc(100% + 12px);
    top: 50%;
    z-index: 30;
    width: max-content;
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 7px 10px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgba(32, 39, 55, 0.12);
    color: var(--ink);
    content: attr(aria-label);
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    opacity: 0;
    pointer-events: none;
    transform: translate(-5px, -50%);
    transition: opacity 150ms ease, transform 150ms ease;
  }

  &:hover {
    background: ${({ $active }) => ($active ? "#edf0ff" : "#f3f4f8")};
    color: ${({ $active }) => ($active ? "var(--primary)" : "var(--ink)")};
  }

  &:hover::after,
  &:focus-visible::after {
    opacity: 1;
    transform: translate(0, -50%);
  }

  @media (max-width: 860px) {
    width: auto;
    min-height: 46px;
    flex: 1 1 0;
    flex-direction: column;
    gap: 1px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "#edf0ff" : "transparent")};
    font-size: 10px;
    line-height: 1;

    &::after {
      display: none;
    }

    span {
      display: block;
    }

    svg {
      width: 21px;
      height: 21px;
    }
  }
`;

const Main = styled.main`
  min-height: 100vh;
  margin-left: 84px;
  padding: 24px clamp(16px, 2vw, 32px) 56px;

  @media (max-width: 860px) {
    margin-left: 0;
    padding: 22px 14px calc(92px + env(safe-area-inset-bottom));
  }
`;

const MainInner = styled.div`
  width: min(1300px, 100%);
  margin: 0 auto;
`;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const normalizedPathname = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");

  const hosoBActive = normalizedPathname === "/";
  const doanhThuActive = normalizedPathname === "/doanh-thu";

  return (
    <Shell>
      <Sidebar>
        <Navigation aria-label="Điều hướng chính">
          <NavItem
            href="/"
            $active={hosoBActive}
            aria-current={hosoBActive ? "page" : undefined}
            aria-label="Hồ sơ"
            title="Hồ sơ"
          >
            <FolderOpen size={19} fill={hosoBActive ? "currentColor" : "none"} />
            <span>Hồ sơ</span>
          </NavItem>
          <NavItem
            href="/doanh-thu"
            $active={doanhThuActive}
            aria-current={doanhThuActive ? "page" : undefined}
            aria-label="Doanh thu"
            title="Doanh thu"
          >
            <TrendingUp size={19} fill={doanhThuActive ? "currentColor" : "none"} />
            <span>Doanh thu</span>
          </NavItem>
        </Navigation>
      </Sidebar>

      <Main>
        <MainInner>{children}</MainInner>
      </Main>
    </Shell>
  );
}
