import { redirect } from "next/navigation";
import { PAGE_ROUTES } from "@/lib/route";

export default function Home() {
  redirect(PAGE_ROUTES.AUTH.SIGN_IN);
}
