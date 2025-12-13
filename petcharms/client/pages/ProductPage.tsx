import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Check, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface Color {
  id: string;
  name: string;
  hex: string;
  rgb: string;
}

interface LetterCharm {
  type: 'letter';
  letter: string;
  colorId: string;
}

interface ShapeCharm {
  type: 'shape';
  shapeId: string;
}

type Charm = LetterCharm | ShapeCharm;

interface CollarColor {
  id: string;
  name: string;
  hex: string;
}

const MAX_CHARMS = 9;
const MAX_LETTERS = 12;
const COLLAR_COLORS: CollarColor[] = [
  { id: "collar-red", name: "Red", hex: "#F8A5A5" },
  { id: "collar-blue", name: "Blue", hex: "#AED6F1" },
  { id: "collar-green", name: "Green", hex: "#ABEBC6" },
  { id: "collar-purple", name: "Purple", hex: "#D7BDE2" },
  { id: "collar-pink", name: "Pink", hex: "#F8BBD0" },
  { id: "collar-yellow", name: "Yellow", hex: "#FFE082" },
  { id: "collar-orange", name: "Orange", hex: "#FFCC80" },
  { id: "collar-brown", name: "Brown", hex: "#D7CCC8" },
  { id: "collar-fluor-yellow", name: "Fluor Yellow", hex: "#FFFF00" },
  { id: "collar-fluor-orange", name: "Fluor Orange", hex: "#FF6600" },
  { id: "collar-fluor-pink", name: "Fluor Pink", hex: "#FF1493" },
  { id: "collar-fluor-green", name: "Fluor Green", hex: "#39FF14" },
  { id: "collar-black", name: "Black", hex: "#1F2937" },
];

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);

  const [petName, setPetName] = useState("");
  const [size, setSize] = useState<"S" | "M" | "L">("M");
  const [collarColor, setCollarColor] = useState<string>("collar-red");
  const [charms, setCharms] = useState<Charm[]>([]);

  const { toast } = useToast();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, shapesRes, colorsRes] = await Promise.all([
          fetch("/api/v1/products"),
          fetch("/api/v1/shapes"),
          fetch("/api/v1/colors"),
        ]);

        const productsData = await productsRes.json();
        const shapesData = await shapesRes.json();
        const colorsData = await colorsRes.json();

        if (productsData.success && productsData.data?.length > 0) {
          setProduct(productsData.data[0]);
        }
        if (shapesData.success && shapesData.data) {
          setShapes(shapesData.data);
        }
        if (colorsData.success && colorsData.data) {
          setColors(colorsData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle pet name change
  const handlePetNameChange = (value: string) => {
    const upperValue = value.toUpperCase().slice(0, MAX_LETTERS);
    const oldLetters = petName;

    // Calculate the difference
    let updatedCharms = [...charms];

    if (upperValue.length === 0) {
      // Clearing pet name: remove all letter charms
      updatedCharms = updatedCharms.filter((charm) => charm.type !== 'letter');
    } else if (upperValue.length > oldLetters.length) {
      // Appending letters: add new letters to the end
      const newLetters = upperValue.slice(oldLetters.length);
      const defaultColorId = colors[0]?.id || "color-orange";
      for (const letter of newLetters) {
        updatedCharms.push({
          type: 'letter',
          letter,
          colorId: defaultColorId,
        });
      }
    } else if (upperValue.length < oldLetters.length) {
      // Removing letters: remove from the end
      const lettersToRemove = oldLetters.length - upperValue.length;
      let removed = 0;
      for (let i = updatedCharms.length - 1; i >= 0 && removed < lettersToRemove; i--) {
        if (updatedCharms[i].type === 'letter') {
          updatedCharms.splice(i, 1);
          removed++;
        }
      }
    }

    setPetName(upperValue);
    setCharms(updatedCharms);
  };

  // Change color for specific letter charm
  const changeLetterColor = (charmIndex: number, colorId: string) => {
    const updated = [...charms];
    if (updated[charmIndex].type === 'letter') {
      updated[charmIndex].colorId = colorId;
      setCharms(updated);
    }
  };

  // Add shape charm
  const handleAddShape = (shapeId: string) => {
    if (charms.length >= MAX_CHARMS) {
      toast({
        title: "Maximum charms reached",
        description: `You can select up to ${MAX_CHARMS} total charms (letters + shapes).`,
      });
      return;
    }

    setCharms([
      ...charms,
      { type: 'shape', shapeId },
    ]);
  };

  // Remove any charm by index
  const handleRemoveCharm = (index: number) => {
    const charm = charms[index];
    if (charm.type === 'letter') {
      // Also update pet name to remove this letter
      const letterIndex = charms.slice(0, index).filter((c) => c.type === 'letter').length;
      const newPetName = petName.slice(0, letterIndex) + petName.slice(letterIndex + 1);
      setPetName(newPetName);
    }
    setCharms(charms.filter((_, i) => i !== index));
  };


  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    if (charms.length === 0) {
      toast({
        title: "Add customizations",
        description:
          "Please add a pet name or shape charms to your collar.",
        variant: "destructive",
      });
      return;
    }

    // Extract letters and shapes from combined charms array
    const letters = charms.filter((c) => c.type === 'letter') as LetterCharm[];
    const shapes = charms.filter((c) => c.type === 'shape') as ShapeCharm[];

    const cartItem = {
      product_id: product.id,
      product_name: product.name,
      size,
      collarColor,
      petName: petName || "Custom",
      customizations: {
        letters,
        shapes,
      },
      total_price: product.price,
    };

    // Save to localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    toast({
      title: "Added to cart!",
      description: `Pet collar for ${petName || "your pet"} added to cart.`,
    });

    // Reset
    setPetName("");
    setCharms([]);
    setSize("M");
    setCollarColor("collar-red");
  };

  const totalCharms = charms.length;
  const canAddMore = totalCharms < MAX_CHARMS;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-70 transition"
            >
              <Sparkles className="w-6 h-6 text-amber-600" />
              <span className="text-xl font-semibold text-neutral-900">
                PetCharms
              </span>
            </Link>
            <div className="flex gap-4">
              <Link
                to="/cart"
                className="text-sm text-neutral-900 hover:text-amber-600"
              >
                Cart
              </Link>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-amber-600 mb-4"></div>
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-70 transition"
            >
              <Sparkles className="w-6 h-6 text-amber-600" />
              <span className="text-xl font-semibold text-neutral-900">
                PetCharms
              </span>
            </Link>
          </div>
        </nav>
        <div className="text-center py-16">
          <p className="text-neutral-600 mb-4">Product not found</p>
          <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="text-sm text-neutral-600 hover:text-neutral-900 mb-8 inline-flex items-center gap-1"
        >
          ← Back to home
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Live Preview */}
          <div>
            <div className="sticky top-24">
              {/* Product Image */}
              <div className="bg-white rounded-2xl p-4 mb-8 flex items-center justify-center h-full min-h-[350px]">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-80 h-80 object-contain rounded-lg"
                />
              </div>

              {/* Real-time Preview */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                <h3 className="font-semibold text-neutral-900 mb-4">
                  🐾 Your Custom Collar
                </h3>
                <div className="bg-white rounded-lg p-8 border-2 border-amber-100 flex flex-col items-center justify-center">
                  <div className="w-full space-y-6">
                    {/* Collar with Charms Overlaid */}
                    <div className="flex flex-col items-center gap-3">
                      {/* Relative container for collar + charms */}
                      <div className="relative w-full h-32 flex items-center justify-center">
                        {/* Visual Collar Band */}
                        <div className="flex flex-col items-center gap-2 w-full absolute top-12">
                          {/* Black base band */}
                          <div
                            className="w-full h-8 rounded-full"
                            style={{
                              backgroundColor: COLLAR_COLORS.find(
                                (c) => c.id === collarColor
                              )?.hex || "#F8A5A5",
                            }}
                          />
                        </div>

                        {/* Charms Overlaid on Collar - In Insertion Order */}
                        <div className="flex flex-wrap items-center justify-center gap-2 relative z-10 px-3">
                          {charms.map((charm, idx) => {
                            if (charm.type === 'letter') {
                              const color = colors.find(
                                (c) => c.id === charm.colorId
                              );
                              return (
                                <span
                                  key={`charm-${idx}`}
                                  onClick={() => handleRemoveCharm(idx)}
                                  className="font-bold text-3xl cursor-pointer hover:scale-110 transition transform"
                                  style={{
                                    color: color?.hex || "#FF6B35",
                                  }}
                                  title={`${charm.letter} - Click to remove`}
                                >
                                  {charm.letter}
                                </span>
                              );
                            } else {
                              const shape = shapes.find(
                                (s) => s.id === charm.shapeId
                              );
                              return (
                                <div
                                  key={`charm-${idx}`}
                                  onClick={() => handleRemoveCharm(idx)}
                                  className="text-3xl cursor-pointer hover:scale-110 transition transform"
                                  title={`${shape?.name} - Click to remove`}
                                >
                                  {shape?.emoji}
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Info below collar */}
                    <div className="text-center space-y-2">
                      <p className="text-sm text-neutral-500 italic">
                        💡 Tip: Click on any charm to remove it
                      </p>
                      <p className="text-sm font-medium text-neutral-600">
                        Collar Color: <span className="font-bold">{COLLAR_COLORS.find((c) => c.id === collarColor)?.name}</span>
                      </p>
                      <p className="text-sm font-medium text-neutral-600">
                        Size: <span className="font-bold">{size}</span>
                      </p>
                      <p className="text-sm text-neutral-500">
                        Total: {charms.length}/{MAX_CHARMS} charms
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Measurements Chart */}
              <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 mt-8">
                <h4 className="font-semibold text-neutral-900 mb-4 text-center">TABLA DE MEDIDAS</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                    <span className="font-medium text-neutral-900">TALLA S:</span>
                    <span className="text-neutral-600">25-40 cm</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                    <span className="font-medium text-neutral-900">TALLA M:</span>
                    <span className="text-neutral-600">35-46 cm</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                    <span className="font-medium text-neutral-900">TALLA L:</span>
                    <span className="text-neutral-600">40-56 cm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-900">TALLA XL:</span>
                    <span className="text-neutral-600">50-66 cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Customization Form */}
          <div>
            {/* Product Info */}
            <div className="mb-8">
              <h1 className="text-4xl font-light text-neutral-900 mb-4">
                {product.name}
              </h1>
              <p className="text-neutral-600 text-lg mb-6">
                {product.description}
              </p>

              {/* Price Box */}
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200 mb-8">
                <p className="text-sm text-neutral-600 mb-2">
                  Fixed Price (All Options)
                </p>
                <p className="text-4xl font-semibold text-amber-700">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-500 mt-3">
                  ✓ Same price regardless of letters, shapes, or size
                </p>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Select Size
              </label>
              <div className="flex gap-3">
                {(["S", "M", "L"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-6 py-3 rounded-lg font-medium transition border-2 ${
                      size === s
                        ? "border-amber-600 bg-amber-50 text-amber-700"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-amber-300"
                    }`}
                  >
                    {s} {s === "S" && "(XS-Small)"} {s === "M" && "(Medium)"}
                    {s === "L" && "(Large-XL)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Collar Color Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Select Collar Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLLAR_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setCollarColor(color.id)}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      collarColor === color.id
                        ? "border-neutral-900 scale-110"
                        : "border-neutral-300"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Pet Name / Letters Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Pet Name (Letters) - Total Max {MAX_CHARMS} Charms
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => handlePetNameChange(e.target.value)}
                placeholder="LUNA, MAX, BELLA..."
                className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-amber-600 focus:outline-none mb-4"
                maxLength={MAX_LETTERS}
              />

              {/* Letter Color Picker */}
              {charms.some((c) => c.type === 'letter') && (
                <div className="space-y-2">
                  {charms.map((charm, idx) =>
                    charm.type === 'letter' ? (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg"
                      >
                        <span className="font-semibold text-neutral-900 w-12">
                          {charm.letter}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color) => (
                            <button
                              key={color.id}
                              onClick={() => changeLetterColor(idx, color.id)}
                              className={`w-6 h-6 rounded-full border-2 transition ${
                                charm.colorId === color.id
                                  ? "border-neutral-900 scale-110"
                                  : "border-neutral-300"
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>

            {/* Shape Charms Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-neutral-900">
                  Shape Charms (Max {MAX_CHARMS - charms.length})
                </label>
                <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                  {totalCharms}/{MAX_CHARMS}
                </span>
              </div>

              {/* Available Shapes */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {shapes.map((shape) => {
                  const isSelected = charms.some(
                    (c) => c.type === 'shape' && c.shapeId === shape.id
                  );
                  const isDisabled = !isSelected && !canAddMore;

                  return (
                    <button
                      key={shape.id}
                      onClick={() => handleAddShape(shape.id)}
                      disabled={isDisabled}
                      className={`p-3 rounded-lg border-2 transition ${
                        isDisabled
                          ? "border-neutral-200 bg-neutral-50 opacity-50 cursor-not-allowed"
                          : isSelected
                            ? "border-amber-600 bg-amber-50"
                            : "border-neutral-200 hover:border-amber-300 bg-white"
                      }`}
                    >
                      <div className="text-2xl mb-1">{shape.emoji}</div>
                      <div className="text-xs font-medium text-neutral-900">
                        {shape.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Shapes List */}
              {charms.some((c) => c.type === 'shape') && (
                <div className="space-y-2 border-t border-neutral-200 pt-4">
                  {charms.map((charm, idx) => {
                    if (charm.type !== 'shape') return null;
                    const shape = shapes.find((s) => s.id === charm.shapeId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{shape?.emoji}</span>
                          <span className="text-sm font-medium text-neutral-900">
                            {shape?.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveCharm(idx)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Remove shape"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full px-6 py-4 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition flex items-center justify-center gap-2 mb-4"
            >
              Add to Cart
              <ChevronRight className="w-5 h-5" />
            </button>

            <Link
              to="/"
              className="w-full px-6 py-3 text-center border border-neutral-300 text-neutral-900 rounded-lg font-medium hover:border-neutral-900 transition"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
