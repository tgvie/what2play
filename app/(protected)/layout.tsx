import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAnonClient } from "@/utils/supabase/server";

/**
 * Redirects to /login if no valid session exists.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get auth tokens from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // No tokens = redirect to login
  if (!accessToken) {
    redirect("/login");
  }

  // Verify the access token is valid
  const supabase = createAnonClient();
  const { data: userData, error } = await supabase.auth.getUser(accessToken);

  // If token invalid and we have refresh token, try to validate refresh
  if (error || !userData?.user) {
    if (refreshToken) {
      // Attempt refresh - if it fails, redirect to login
      const { error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (refreshError) {
        redirect("/login");
      }
      // If refresh succeeded, the user is valid - continue rendering
    } else {
      redirect("/login");
    }
  }

  // User is authenticated - render protected content
  return <>{children}</>;
}
