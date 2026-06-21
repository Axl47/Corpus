import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getInviteByToken } from "@/lib/actions/invites";
import InviteAcceptClient from "@/components/features/InviteAcceptClient";

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-7 flex flex-col items-center text-center gap-4">
        <Image
          src="/logo-square-transparent.png"
          alt="Corpus"
          width={44}
          height={44}
        />
        {children}
      </div>
    </div>
  );
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getTranslations("Auth");
  const tErrors = await getTranslations("Errors");
  const session = await auth();
  const invite = await getInviteByToken(token);

  if (!invite) {
    return (
      <InviteShell>
        <p className="text-sm text-neutral-400">{tErrors("inviteInvalid")}</p>
      </InviteShell>
    );
  }
  if (invite.expired) {
    return (
      <InviteShell>
        <p className="text-sm text-neutral-400">{tErrors("inviteExpired")}</p>
      </InviteShell>
    );
  }

  // Logged in → auto-accept and go to the app.
  if (session?.user) {
    return (
      <InviteShell>
        <h1 className="m-0 text-base font-semibold text-neutral-100">
          {t("inviteJoinTitle", { workspace: invite.workspaceName })}
        </h1>
        <InviteAcceptClient token={token} />
      </InviteShell>
    );
  }

  // Not logged in → stash the token in a cookie, then send them to sign in.
  // After login, /app picks the cookie up and routes back here.
  async function signInToAccept() {
    "use server";
    const c = await cookies();
    c.set("pending_invite", token, {
      path: "/",
      maxAge: 600,
      httpOnly: true,
      sameSite: "lax",
    });
    redirect("/login");
  }

  return (
    <InviteShell>
      <h1 className="m-0 text-base font-semibold text-neutral-100">
        {t("inviteJoinTitle", { workspace: invite.workspaceName })}
      </h1>
      <p className="m-0 text-[13px] text-neutral-400 leading-relaxed">
        {t("inviteJoinBody")}
      </p>
      <form action={signInToAccept} className="w-full">
        <button
          type="submit"
          className="w-full px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white bg-blue-500 hover:opacity-90 transition-opacity"
        >
          {t("inviteSignIn")}
        </button>
      </form>
      <Link
        href="/"
        className="text-[12px] text-neutral-500 hover:text-neutral-300"
      >
        Corpus
      </Link>
    </InviteShell>
  );
}
