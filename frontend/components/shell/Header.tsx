"use client";

import React from "react";
import Navbar, { NavbarProps } from "./Navbar";

export default function Header(props: NavbarProps) {
  return <Navbar variant="authenticated" {...props} />;
}
