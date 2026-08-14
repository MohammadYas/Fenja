import { NextResponse, type NextRequest } from "next/server";
import { opretServerKlient } from "@/lib/supabase/server";

// Progress-data til polling (B-4): reelle pipeline-trin fra generations-rækkerne.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  // RLS sikrer at brugeren kun ser egne items
  const { data: item } = await supabase
    .from("items")
    .select("id, leveret_at, generations(kind, status)")
    .eq("id", id)
    .maybeSingle();
  if (!item) return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });

  return NextResponse.json({
    leveret: item.leveret_at != null,
    trin: (item.generations as { kind: string; status: string }[]).map((g) => ({
      kind: g.kind,
      status: g.status,
    })),
  });
}
