import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        if (authData.session) {
          setIsLoggedIn(true);
          setUserEmail(authData.session.user.email || "");
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
        setUserEmail(session?.user.email || "");
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to logout",
          variant: "destructive",
        });
        return;
      }

      setIsLoggedIn(false);
      setUserEmail("");
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });

      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Error",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-70 transition"
        >
          <Sparkles className="w-6 h-6 text-amber-600" />
          <span className="text-xl font-semibold text-neutral-900">
            🐾 PetCharms
          </span>
        </Link>

        <div className="flex gap-6 items-center">
          <a
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition"
          >
            Shop
          </a>

          {isLoggedIn && (
            <>
              <Link
                to="/orders"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition"
              >
                My Orders
              </Link>
              <span className="text-neutral-300">|</span>
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition"
              >
                Login
              </Link>
              <span className="text-neutral-300">|</span>
            </>
          )}

          <Link
            to="/cart"
            className="text-sm text-neutral-900 font-medium hover:text-amber-600 transition flex items-center gap-1"
          >
            Cart
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
