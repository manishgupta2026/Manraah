"use client";

import React, { useState } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { getInitials, getAvatarPalette } from "@/frontend/lib/avatar-helper";

export interface UserAvatarProps {
  user?: {
    name?: string | null;
    sanctuaryName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    profileImage?: string | null;
  } | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  profileImage?: string | null;
  sizeClass?: string;
  className?: string;
  showBorder?: boolean;
}

export default function UserAvatar({
  user: explicitUser,
  name: explicitName,
  firstName: explicitFirstName,
  lastName: explicitLastName,
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
  const rawAvatarUrl = explicitProfileImage || explicitAvatar || user?.profileImage || user?.avatar;
  
  // Only use image URL if it is a real custom uploaded image, not a generic fallback image
  const isPlaceholder =
    !rawAvatarUrl ||
    rawAvatarUrl.includes("user_avatar.jpg") ||
    rawAvatarUrl.includes("default_avatar.jpg") ||
    rawAvatarUrl.includes("default-avatar") ||
    rawAvatarUrl.includes("default-professional");

  const avatarUrl = isPlaceholder ? null : rawAvatarUrl;
  const displayName = explicitName || user?.name || user?.sanctuaryName || "";
  const firstName = explicitFirstName || user?.firstName;
  const lastName = explicitLastName || user?.lastName;

  const [hasError, setHasError] = useState(false);

  // If valid custom uploaded image URL is available and hasn't errored, render clean circular img
  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        onError={() => setHasError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 select-none ${
          showBorder ? "border-2 border-white/20 dark:border-white/10" : ""
        } ${className}`}
      />
    );
  }

  // Neutral Guest Silhouette Avatar when no authenticated user or name is present
  if (!displayName && !avatarUrl) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-[#0E342B] dark:bg-[#14382F] text-[#8EAAA1] dark:text-[#78958C] flex items-center justify-center shrink-0 select-none shadow-xs ${
          showBorder ? "border-2 border-white/20 dark:border-white/10" : ""
        } ${className}`}
        title="Guest Sanctuary Member"
        aria-label="Guest"
      >
        <svg className="w-[55%] h-[55%]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }

  // Consistent Fallback Initials Badge using deterministic avatar color palette
  const initials = getInitials(displayName, firstName, lastName);
  const palette = getAvatarPalette(displayName);

  return (
    <div
      style={{ backgroundColor: palette.bg, color: palette.text }}
      className={`${sizeClass} rounded-full font-heading font-black flex items-center justify-center tracking-wider shrink-0 select-none shadow-xs ${
        showBorder ? "border-2 border-white/30 dark:border-white/20" : ""
      } ${className}`}
      title={displayName}
      aria-label={displayName}
    >
      <span className="leading-none text-center select-none flex items-center justify-center">
        {initials}
      </span>
    </div>
  );
}

