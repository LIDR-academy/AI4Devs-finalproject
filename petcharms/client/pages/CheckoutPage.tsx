import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface CartItem {
  product_id: string;
  product_name: string;
  size: "S" | "M" | "L";
  collarColor: string;
  petName: string;
  customizations: {
    letters: Array<{ letter: string; colorId: string }>;
    shapes: Array<{ shapeId: string }>;
  };
  total_price: number;
}

interface FormData {
  fullName: string;
  email: string;
  address: string;
  phone: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  address?: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        if (parsedCart.length === 0) {
          navigate("/cart");
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        navigate("/cart");
      }
    } else {
      navigate("/cart");
    }
  }, [navigate]);

  // Validate email
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: authData } = await supabase.auth.getSession();

      if (!authData.session) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to complete your order",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const userId = authData.session.user.id;
      const totalPrice = cart.reduce((sum, item) => sum + item.total_price, 0);

      // Save order to Supabase
      const { error: insertError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: userId,
            product_id: cart[0]?.product_id || "",
            size: cart[0]?.size || "M",
            collar_color: cart[0]?.collarColor || "collar-red",
            pet_name: cart[0]?.petName || "Custom",
            customizations: cart[0]?.customizations || {
              letters: [],
              shapes: [],
            },
            total_price: totalPrice,
            status: "pending",
          },
        ]);

      if (insertError) {
        console.error("Error saving order:", insertError);
        toast({
          title: "Error",
          description: "Failed to save your order",
          variant: "destructive",
        });
        return;
      }

      // Also call the API endpoint for backward compatibility
      const orderData = {
        product_id: cart[0]?.product_id || "",
        size: cart[0]?.size || "M",
        collarColor: cart[0]?.collarColor || "collar-red",
        petName: cart[0]?.petName || "Custom",
        customizations: cart[0]?.customizations || {
          letters: [],
          shapes: [],
        },
        total_price: totalPrice,
      };

      const apiResponse = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const apiResult = await apiResponse.json();

      // Save order info to localStorage
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          orderId: apiResult.data?.id,
          customerName: formData.fullName,
          customerEmail: formData.email,
          cart: cart,
          total: totalPrice,
          createdAt: new Date().toISOString(),
        })
      );

      // Clear cart
      localStorage.setItem("cart", "[]");

      toast({
        title: "Order created!",
        description: "Your order has been successfully created.",
      });

      // Redirect to confirmation
      navigate("/confirmation");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating your order",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <span className="text-xl font-semibold text-neutral-900">🐾 PetCharms</span>
          </Link>
          <div className="flex gap-4">
            <Link to="/cart" className="text-sm text-neutral-600 hover:text-neutral-900">
              Back to Cart
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-light text-neutral-900 mb-12">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-600 transition ${
                    errors.fullName
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200"
                  }`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-600 transition ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200"
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Shipping Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-amber-600 transition resize-none ${
                    errors.address
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200"
                  }`}
                  placeholder="123 Main St, City, State, ZIP Code"
                />
                {errors.address && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.address}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:outline-none focus:border-amber-600 transition"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? "Processing..." : "Confirm Order"}
                {!submitting && <ChevronRight className="w-5 h-5" />}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 sticky top-24">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
                {cart.map((item, index) => (
                  <div key={index}>
                    <p className="font-medium text-neutral-900 mb-2">
                      {item.product_name}
                    </p>
                    <div className="space-y-1 text-xs text-neutral-600 mb-3">
                      {item.petName && <p>Pet Name: {item.petName}</p>}
                      <p>Size: {item.size}</p>
                      {item.customizations.letters.length > 0 && (
                        <p>Letters: {item.customizations.letters.length}</p>
                      )}
                      {item.customizations.shapes.length > 0 && (
                        <p>Shape Charms: {item.customizations.shapes.length}</p>
                      )}
                    </div>
                    <p className="text-right font-semibold text-amber-700">
                      ${item.total_price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-2xl font-bold text-amber-700">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <p className="text-xs text-neutral-500">
                Free shipping on all orders. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
