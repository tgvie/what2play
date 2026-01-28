import { cookies } from "next/headers";
import HomeContent from "@/components/HomeContent";

/**
 * HOME
 */
export default async function Home() {
  // Check if user is logged in (simple cookie check for UI purposes)
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("access_token")?.value;

  return <HomeContent isLoggedIn={isLoggedIn} />;
}
