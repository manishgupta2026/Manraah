"use client";

import React, { useState } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

export interface UserAvatarProps {
  user?: {
    name?: string | null;
    sanctuaryName?: string | null;
    avatar?: string | null;
    profileImage?: string | null;
  } | null;
  name?: string | null;
  avatar?: string | null;
  profileImage?: string | null;
  sizeClass?: string;
  className?: string;
  showBorder?: boolean;
}

export default function UserAvatar({
  user: explicitUser,
  name: explicitName,
  avatar: explicitAvatar,
  profileImage: explicitProfileImage,
  sizeClass = "w-9 h-9 text-xs",
  className = "",
  showBorder = true,
}: UserAvatarProps) {
  // Use auth context for fallback if explicit props not provided
  let authUser = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auth = useAuth();
    authUser = auth.user;
  } catch {
    // Context may not be mounted in standalone isolated pages
  }

  const user = explicitUser !== undefined ? explicitUser : authUser;
  const avatarUrl = explicitProfileImage || explicitAvatar || user?.profileImage || user?.avatar || (user ? "/images/user_avatar.jpg" : null);
  const displayName = explicitName || user?.sanctuaryName || user?.name || "Sanctuary Member";

  const [hasError, setHasError] = useState(false);

  // If valid image URL is available and hasn't errored, render clean circular img
  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        onError={() => setHasError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 select-none ${
          showBorder ? "border border-white/20 dark:border-white/10" : ""
        } ${className}`}
      />
    );
  }

  // Consistent Fallback Initials Badge
  const initials = getInitials(displayName) || "M";
  const bgColor = getPastelBgColor(displayName);
  const textColor = getPastelTextColor(displayName);

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold tracking-wider shrink-0 select-none shadow-xs ${
        showBorder ? "border border-white/20 dark:border-white/10" : ""
      } ${className}`}
    >
      {initials}
    </div>
  );
}
