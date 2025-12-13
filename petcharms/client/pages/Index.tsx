import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, Sparkles } from "lucide-react";
import Header from "@/components/Header";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface Shape {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export default function Index() {
  const [product, setProduct] = useState<Product | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, shapesRes] = await Promise.all([
          fetch("/api/v1/products"),
          fetch("/api/v1/shapes"),
        ]);

        if (!productsRes.ok || !shapesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const productsData = await productsRes.json();
        const shapesData = await shapesRes.json();

        if (
          productsData.success &&
          productsData.data &&
          productsData.data.length > 0
        ) {
          setProduct(productsData.data[0]);
        }
        if (shapesData.success && shapesData.data) {
          setShapes(shapesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-amber-50 w-fit px-3 py-1 rounded-full mb-6">
                <span className="text-sm font-medium text-amber-700">
                  🎨 Customize Your Pet's Style
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-light text-neutral-900 mb-6 tracking-tight">
                Personalized Collars for{" "}
                <span className="font-semibold text-amber-600">
                  Furry Friends
                </span>
              </h1>

              <p className="text-lg text-neutral-600 mb-8 leading-relaxed max-w-md">
                Create a unique, colorful collar for your pet with custom
                letters and fun charm shapes. Every collar is made with love.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-fit">
                <Link
                  to="/product"
                  className="px-8 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition inline-flex items-center gap-2"
                >
                  Design Collar Now
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href="#shapes"
                  className="px-8 py-3 border border-neutral-300 text-neutral-900 rounded-lg font-medium hover:border-neutral-900 transition"
                >
                  See All Charms
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-16 pt-16 border-t border-neutral-200">
                <div>
                  <p className="text-sm text-neutral-600">Styles</p>
                  <p className="text-2xl font-semibold text-neutral-900">1</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Charm Shapes</p>
                  <p className="text-2xl font-semibold text-neutral-900">
                    {shapes.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Colors Available</p>
                  <p className="text-2xl font-semibold text-neutral-900">10</p>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative h-96 md:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-50 rounded-3xl"></div>
              <div className="relative h-full flex items-center justify-center p-8">
                <img
                  src="/placeholder.svg"
                  alt="Dog with colorful pet collar"
                  className="w-full h-full object-contain rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="shop" className="py-20 md:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mb-4">
              Create Your Pet's Unique Look
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Choose your pet's name as letters and add colorful charm shapes.
              All with a fixed price of just $15!
            </p>
          </div>

          {product && !loading && (
            <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>

              <div>
                <h3 className="text-3xl font-light text-neutral-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-neutral-600 mb-6">{product.description}</p>

                <div className="bg-amber-50 rounded-lg p-4 mb-8 border border-amber-200">
                  <p className="text-sm text-neutral-600 mb-1">Fixed Price</p>
                  <p className="text-3xl font-semibold text-amber-700">
                    ${product.price.toFixed(2)}
                  </p>
                  <ul className="text-xs text-neutral-600 mt-3 space-y-1">
                    <li>✓ Custom letters with colors</li>
                    <li>✓ Up to 9 total charm shapes</li>
                    <li>✓ 10 vibrant colors for letters</li>
                    <li>✓ 3 sizes (S, M, L)</li>
                  </ul>
                </div>

                <Link
                  to="/product"
                  className="w-full px-6 py-4 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition inline-flex items-center justify-center gap-2"
                >
                  Start Customizing
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <p className="text-sm text-neutral-500 mt-4 text-center">
                  Personalize with your pet's name and favorite shapes
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-amber-600"></div>
              <p className="mt-4 text-neutral-600">Loading collection...</p>
            </div>
          )}
        </div>
      </section>

      {/* Shapes Showcase Section */}
      <section id="shapes" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mb-4">
              Choose Your Charm Shapes
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Add up to 9 fun charm shapes to your pet's collar. Mix with custom letters.
            </p>
          </div>

          {shapes.length > 0 && !loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {shapes.map((shape) => (
                <div
                  key={shape.id}
                  className="group bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition text-center"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition">
                    {shape.emoji}
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">
                    {shape.name}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    {shape.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-amber-600"></div>
              <p className="mt-4 text-neutral-600">Loading shapes...</p>
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              to="/product"
              className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition"
            >
              Start Designing
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Fully Customizable
              </h3>
              <p className="text-neutral-600">
                Add your pet's name with colored letters and choose from 35+ charm shapes.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Fixed Pricing
              </h3>
              <p className="text-neutral-600">
                One price for all options. No matter how many charms or which
                size you choose.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Made with Love
              </h3>
              <p className="text-neutral-600">
                Quality collars designed to make your pet look amazing and feel
                comfortable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mb-6">
            Ready to make your pet shine?
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Create a custom collar that shows off your pet's unique personality.
          </p>
          <Link
            to="/product"
            className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition"
          >
            Design Your Collar
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-neutral-900">PetCharms</span>
              </div>
              <p className="text-sm text-neutral-600">
                Personalized collars for every furry friend.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#shop"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition"
                  >
                    Collars
                  </a>
                </li>
                <li>
                  <a
                    href="#shapes"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition"
                  >
                    Shapes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-8">
            <p className="text-sm text-neutral-600 text-center">
              © 2025 PetCharms. All rights reserved. Made with{" "}
              <Heart className="w-3 h-3 inline text-red-500" /> for pets.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
