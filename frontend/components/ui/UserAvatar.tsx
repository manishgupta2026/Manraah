"use client";

import React from "react";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

export interface UserAvatarProps {
  user?: {
    name?: string | null;
    sanctuaryName?: string | null;
    avatar?: string | null;
  } | null;
  name?: string | null;
  avatar?: string | null;
  sizeClass?: string;
  className?: string;
}

export default function UserAvatar({
  user,
  name: explicitName,
  avatar: explicitAvatar,
  sizeClass = "w-9 h-9 text-xs",
  className = "",
}: UserAvatarProps) {
  const avatarUrl = explicitAvatar ?? user?.avatar;
  const displayName = explicitName ?? user?.name ?? user?.sanctuaryName ?? "Member";

  const hasCustomAvatar =
    avatarUrl &&
    avatarUrl !== "" &&
    avatarUrl !== "/images/user_avatar.jpg" &&
    !avatarUrl.includes("placeholder") &&
    (avatarUrl.startsWith("data:") || avatarUrl.startsWith("/") || avatarUrl.startsWith("http"));

  if (hasCustomAvatar) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || "Profile"}
        className={`${sizeClass} rounded-full object-cover border border-white/10 shrink-0 ${className}`}
      />
    );
  }

  const initials = getInitials(displayName);
  const bgColor = getPastelBgColor(displayName);
  const textColor = getPastelTextColor(displayName);

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold tracking-wider border border-white/10 shrink-0 select-none shadow-xs ${className}`}
    >
      {initials || "M"}
    </div>
  );
}
