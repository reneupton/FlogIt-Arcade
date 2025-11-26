import Image from "next/image";

type ProgressPayload = {
  username: string;
  balanceDelta?: number;
  xpDelta?: number;
  level?: number;
  updatedBy?: string;
  reason?: string;
};

type AvatarPayload = {
  username: string;
  avatarUrl?: string;
  updatedBy?: string;
};

type CooldownPayload = {
  username: string;
  updatedBy?: string;
};

type StatusPayload = {
  auctionId: string;
  title?: string;
  brand?: string;
  status: string;
  changedBy?: string;
};

type Props =
  | { type: "progress"; payload: ProgressPayload }
  | { type: "avatar"; payload: AvatarPayload }
  | { type: "status"; payload: StatusPayload }
  | { type: "cooldown"; payload: CooldownPayload };

function badge(text: string) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-white/60">
      {text}
    </span>
  );
}

export default function AdminActionToast(props: Props) {
  if (props.type === "progress") {
    const { payload } = props;
    const parts: string[] = [];
    if (payload.balanceDelta) {
      parts.push(`${payload.balanceDelta > 0 ? "⬆️" : "⬇️"} ${payload.balanceDelta} Gold`);
    }
    if (payload.xpDelta) {
      parts.push(`${payload.xpDelta > 0 ? "✨" : "⬇️"} ${payload.xpDelta} XP`);
    }
    if (payload.level) {
      parts.push(`⭐ Lv ${payload.level}`);
    }
    return (
      <div className="flex items-center gap-3 bg-white/90 px-3 py-2 rounded-2xl border border-white/70 shadow-lg">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-200 via-sky-200 to-indigo-200 flex items-center justify-center text-xl">🔔</div>
        <div className="flex flex-col text-slate-800">
          <span className="font-semibold">Admin updated your progress</span>
          <span className="text-sm text-slate-600">{parts.join(" • ") || "Changes applied"}</span>
          <div className="flex gap-2 mt-1">
            {badge(payload.updatedBy ? `By ${payload.updatedBy}` : "Admin action")}
            {payload.reason ? badge(payload.reason) : null}
          </div>
        </div>
      </div>
    );
  }

  if (props.type === "avatar") {
    const { payload } = props;
    return (
      <div className="flex items-center gap-3 bg-white/90 px-3 py-2 rounded-2xl border border-white/70 shadow-lg">
        {payload.avatarUrl ? (
          <div className="h-12 w-12 relative rounded-2xl overflow-hidden border border-white/70 shadow">
            <Image src={payload.avatarUrl} alt="New avatar" fill className="object-cover" />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-200 via-amber-200 to-emerald-200 flex items-center justify-center text-xl">🪄</div>
        )}
        <div className="flex flex-col text-slate-800">
          <span className="font-semibold">Avatar updated</span>
          <span className="text-sm text-slate-600">Changed by {payload.updatedBy ?? "admin"}</span>
        </div>
      </div>
    );
  }

  if (props.type === "status") {
    const { payload } = props;
    return (
      <div className="flex items-center gap-3 bg-white/90 px-3 py-2 rounded-2xl border border-white/70 shadow-lg">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 flex items-center justify-center text-xl">📜</div>
        <div className="flex flex-col text-slate-800">
          <span className="font-semibold">Auction status updated</span>
          <span className="text-sm text-slate-600">
            {payload.status} • {payload.title ?? payload.auctionId}
          </span>
          <div className="flex gap-2 mt-1">
            {badge(payload.changedBy ? `By ${payload.changedBy}` : "Admin action")}
          </div>
        </div>
      </div>
    );
  }

  if (props.type === "cooldown") {
    const { payload } = props;
    return (
      <div className="flex items-center gap-3 bg-white/90 px-3 py-2 rounded-2xl border border-white/70 shadow-lg">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200 flex items-center justify-center text-xl">⏱️</div>
        <div className="flex flex-col text-slate-800">
          <span className="font-semibold">Cooldown reset</span>
          <span className="text-sm text-slate-600">For {payload.username}</span>
          <div className="flex gap-2 mt-1">
            {badge(payload.updatedBy ? `By ${payload.updatedBy}` : "Admin action")}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
