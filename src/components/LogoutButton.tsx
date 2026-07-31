"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
    >
      Sair
    </button>
  );
}
