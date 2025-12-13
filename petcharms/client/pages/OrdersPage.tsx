import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface Order {
  id: string;
  product_id: string;
  size: "S" | "M" | "L";
  collar_color: string;
  pet_name: string;
  customizations: {
    letters: Array<{ letter: string; colorId: string }>;
    shapes: Array<{ shapeId: string }>;
  };
  total_price: number;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        
        if (!authData.session) {
          navigate("/login");
          return;
        }

        // Fetch user profile
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.session.user.id)
          .single();

        if (userData) {
          setUser(userData);
        }

        // Fetch orders
        const { data: ordersData, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", authData.session.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          toast({
            title: "Error",
            description: "Failed to load your orders",
            variant: "destructive",
          });
        } else {
          setOrders(ordersData || []);
        }
      } catch (err) {
        console.error("Error:", err);
        toast({
          title: "Error",
          description: "An error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition">
              <Sparkles className="w-6 h-6 text-amber-600" />
              <span className="text-xl font-semibold text-neutral-900">🐾 PetCharms</span>
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-amber-600 mb-4"></div>
            <p className="text-neutral-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-neutral-900 mb-2">My Orders</h1>
          <p className="text-neutral-600">
            Hello, {user?.full_name || user?.email}
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition"
            >
              Start Shopping
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-neutral-200 rounded-lg p-6 hover:border-amber-600 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {order.pet_name}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Order ID: {order.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-700">
                      ${order.total_price.toFixed(2)}
                    </p>
                    <p className="text-sm text-neutral-600 capitalize">
                      Status: {order.status}
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-600">Size</p>
                      <p className="font-semibold text-neutral-900">{order.size}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">Collar Color</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-4 h-4 rounded-full border border-neutral-300"
                          style={{
                            backgroundColor: order.collar_color,
                          }}
                        />
                        <span className="text-sm font-medium text-neutral-900">
                          {order.collar_color}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">Letters</p>
                      <p className="font-semibold text-neutral-900">
                        {order.customizations.letters.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">Charms</p>
                      <p className="font-semibold text-neutral-900">
                        {order.customizations.shapes.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Date */}
                <p className="text-xs text-neutral-500 mt-4">
                  Ordered on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
