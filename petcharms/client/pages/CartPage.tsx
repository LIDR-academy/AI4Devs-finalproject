import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ChevronRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, []);

  const handleRemoveItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    toast({
      title: "Removed from cart",
      description: "Item removed successfully.",
    });
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.setItem("cart", "[]");
    toast({
      title: "Cart cleared",
      description: "All items removed.",
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-light text-neutral-900 mb-8">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-neutral-600 mb-6">
              Start designing a custom collar for your pet
            </p>
            <Link
              to="/product"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition"
            >
              Design Now
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {item.product_name}
                      </h3>
                      <div className="space-y-2">
                        {/* Pet Name */}
                        {item.petName && (
                          <div>
                            <p className="text-xs font-medium text-neutral-600">
                              Pet Name:
                            </p>
                            <p className="text-sm font-semibold text-neutral-900">
                              {item.petName}
                            </p>
                          </div>
                        )}

                        {/* Size */}
                        <div>
                          <p className="text-xs font-medium text-neutral-600">
                            Size: <span className="font-bold">{item.size}</span>
                          </p>
                        </div>

                        {/* Collar Color */}
                        {item.collarColor && (
                          <div>
                            <p className="text-xs font-medium text-neutral-600 mb-1">
                              Collar Color:
                            </p>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-neutral-300"
                                style={{
                                  backgroundColor: {
                                    "collar-red": "#DC2626",
                                    "collar-blue": "#2563EB",
                                    "collar-green": "#16A34A",
                                    "collar-purple": "#7C3AED",
                                    "collar-pink": "#EC4899",
                                    "collar-yellow": "#EAB308",
                                    "collar-orange": "#EA580C",
                                    "collar-black": "#000000",
                                    "collar-brown": "#92400E",
                                  }[item.collarColor] || "#DC2626",
                                }}
                              />
                              <span className="text-sm font-semibold text-neutral-900">
                                {item.collarColor
                                  .replace("collar-", "")
                                  .charAt(0)
                                  .toUpperCase() +
                                  item.collarColor.replace("collar-", "").slice(1)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Customizations Summary */}
                        {(item.customizations.letters.length > 0 ||
                          item.customizations.shapes.length > 0) && (
                          <div>
                            <p className="text-xs font-medium text-neutral-600 mb-1">
                              Customizations:
                            </p>
                            <div className="text-xs text-neutral-700">
                              {item.customizations.letters.length > 0 && (
                                <p>
                                  {item.customizations.letters.length} letters
                                </p>
                              )}
                              {item.customizations.shapes.length > 0 && (
                                <p>
                                  {item.customizations.shapes.length} shape
                                  charms
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-neutral-400 hover:text-red-600 transition p-2"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="border-t border-neutral-200 pt-4 flex justify-between items-center">
                    <span className="text-neutral-600">Price:</span>
                    <span className="text-lg font-semibold text-amber-700">
                      ${item.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 sticky top-24">
                <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="text-2xl font-bold text-amber-700">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full px-6 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition flex items-center justify-center gap-2 mb-3"
                >
                  Proceed to Checkout
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleClearCart}
                  className="w-full px-6 py-3 border border-neutral-300 text-neutral-900 rounded-lg font-medium hover:border-neutral-900 transition"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
