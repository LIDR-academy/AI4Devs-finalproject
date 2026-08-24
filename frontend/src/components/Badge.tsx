type BadgeTone = "neutral" | "success" | "warning" | "danger";

type BadgeProps = {
   tone?: BadgeTone;
   children: React.ReactNode;
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
   return <span className={`badge badge-${tone}`}>{children}</span>;
}
