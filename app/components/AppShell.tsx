"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileChartLine, PanelBottomDashed } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import styled from "styled-components";

const Shell = styled.div`
  min-height: 100vh;
`;

const Sidebar = styled.aside<{ $mobileHidden: boolean }>`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  display: flex;
  width: 96px;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.88);
  padding: 16px 12px 22px;
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
    transition: transform 220ms ease, opacity 150ms ease, visibility 150ms ease;
    will-change: transform;

    ${({ $mobileHidden }) =>
      $mobileHidden &&
      `
        transform: translate(-50%, calc(100% + 28px));
      `}

    body.profile-modal-open & {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }
  }
`;

const Navigation = styled.nav`
  display: grid;
  gap: 10px;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  gap: 3px;
  border-radius: 14px;
  padding: 0;
  background: ${({ $active }) => ($active ? "#edf0ff" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--primary)" : "#5f6779")};
  font-size: 9px;
  font-weight: 650;
  text-decoration: none;
  text-transform: capitalize;
  transition: 150ms ease;

  span {
    display: block;
  }

  svg {
    width: 22px;
    height: 22px;
    fill: none;
  }

  &::after {
    display: none;
  }

  &:hover {
    background: ${({ $active }) => ($active ? "#edf0ff" : "#f3f4f8")};
    color: ${({ $active }) => ($active ? "var(--primary)" : "var(--ink)")};
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
  margin-left: 96px;
  padding: 24px clamp(14px, 1.6vw, 26px) 56px;

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
  const [isMobileNavHidden, setIsMobileNavHidden] = useState(false);
  const normalizedPathname = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");

  const hosoBActive = normalizedPathname === "/";
  const doanhThuActive = normalizedPathname === "/doanh-thu";

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let distanceInDirection = 0;
    let frameId: number | null = null;

    const updateNavigation = () => {
      frameId = null;

      if (window.innerWidth > 860) {
        setIsMobileNavHidden(false);
        return;
      }

      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - lastScrollY;

      if (currentScrollY <= 8) {
        distanceInDirection = 0;
        setIsMobileNavHidden(false);
      } else if (scrollDelta > 0) {
        distanceInDirection = Math.max(0, distanceInDirection) + scrollDelta;

        if (distanceInDirection >= 16) {
          setIsMobileNavHidden(true);
          distanceInDirection = 0;
        }
      } else if (scrollDelta < 0) {
        distanceInDirection = Math.min(0, distanceInDirection) + scrollDelta;

        if (distanceInDirection <= -16) {
          setIsMobileNavHidden(false);
          distanceInDirection = 0;
        }
      }

      lastScrollY = currentScrollY;
    };

    const scheduleUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateNavigation);
      }
    };

    const resetOnResize = () => {
      lastScrollY = window.scrollY;
      distanceInDirection = 0;
      if (window.innerWidth > 860) setIsMobileNavHidden(false);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", resetOnResize);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", resetOnResize);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <Shell>
      <Sidebar $mobileHidden={isMobileNavHidden}>
        <Navigation aria-label="Điều hướng chính">
          <NavItem
            href="/"
            $active={hosoBActive}
            aria-current={hosoBActive ? "page" : undefined}
            aria-label="Hồ sơ"
            title="Hồ sơ"
          >
            <PanelBottomDashed size={19} />
            <span>Hồ sơ</span>
          </NavItem>
          <NavItem
            href="/doanh-thu"
            $active={doanhThuActive}
            aria-current={doanhThuActive ? "page" : undefined}
            aria-label="Doanh thu"
            title="Doanh thu"
          >
            <FileChartLine size={19} />
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
