"use client";

import React from "react";
import Navbar, { NavbarProps } from "./Navbar";

export default function PublicNavbar(props: NavbarProps) {
  return <Navbar variant="auto" {...props} />;
}
