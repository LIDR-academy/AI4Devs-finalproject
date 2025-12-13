import { RequestHandler } from "express";

export const handleGetShapes: RequestHandler = (req, res) => {
  const shapes = [
    {
      id: "shape-unicorn",
      name: "Unicornio",
      emoji: "🦄",
      description: "Magical unicorn charm",
    },
    {
      id: "shape-angel-wings",
      name: "Alas de ángel",
      emoji: "👼",
      description: "Angel wings charm",
    },
    {
      id: "shape-fairy",
      name: "Hada",
      emoji: "🧚",
      description: "Fairy charm",
    },
    {
      id: "shape-shooting-star",
      name: "Estrella fugaz",
      emoji: "✨",
      description: "Shooting star charm",
    },
    {
      id: "shape-rainbow",
      name: "Arcoíris",
      emoji: "🌈",
      description: "Rainbow charm",
    },
    {
      id: "shape-moon-smile",
      name: "Luna con carita",
      emoji: "🌙",
      description: "Moon with smile charm",
    },
    {
      id: "shape-happy-cloud",
      name: "Nube sonriente",
      emoji: "☁️",
      description: "Happy cloud charm",
    },
    {
      id: "shape-castle",
      name: "Castillito mágico",
      emoji: "🏰",
      description: "Magical castle charm",
    },
    {
      id: "shape-magic-wand",
      name: "Varita mágica",
      emoji: "🪄",
      description: "Magic wand charm",
    },
    {
      id: "shape-heart-paw",
      name: "Corazón con huellita",
      emoji: "💕",
      description: "Heart with paw charm",
    },
    {
      id: "shape-glitter-heart",
      name: "Corazón con glitter",
      emoji: "💖",
      description: "Glitter heart charm",
    },
    {
      id: "shape-common-heart",
      name: "Corazón común",
      emoji: "❤️",
      description: "Common heart charm",
    },
    {
      id: "shape-dollar",
      name: "Dolar",
      emoji: "💲",
      description: "Dollar charm",
    },
    {
      id: "shape-dog-paw",
      name: "Huellita de perro",
      emoji: "🐾",
      description: "Dog paw charm",
    },
    {
      id: "shape-dog-face",
      name: "Carita de perrito",
      emoji: "🐶",
      description: "Dog face charm",
    },
    {
      id: "shape-cat-face",
      name: "Carita de gatito",
      emoji: "🐱",
      description: "Cat face charm",
    },
    {
      id: "shape-bunny",
      name: "Conejito",
      emoji: "🐰",
      description: "Bunny charm",
    },
    {
      id: "shape-bear",
      name: "Osito",
      emoji: "🐻",
      description: "Bear charm",
    },
    {
      id: "shape-penguin",
      name: "Pingüino",
      emoji: "🐧",
      description: "Penguin charm",
    },
    {
      id: "shape-panda",
      name: "Panda",
      emoji: "🐼",
      description: "Panda charm",
    },
    {
      id: "shape-fox",
      name: "Zorrito",
      emoji: "🦊",
      description: "Fox charm",
    },
    {
      id: "shape-baby-dino",
      name: "Dino bebé",
      emoji: "🦕",
      description: "Baby dino charm",
    },
    {
      id: "shape-turtle",
      name: "Tortuguita",
      emoji: "🐢",
      description: "Turtle charm",
    },
    {
      id: "shape-whale",
      name: "Ballenita",
      emoji: "🐳",
      description: "Whale charm",
    },
    {
      id: "shape-dolphin",
      name: "Delfín",
      emoji: "🐬",
      description: "Dolphin charm",
    },
    {
      id: "shape-nature-cute",
      name: "🌸 Naturaleza cute",
      emoji: "🌿",
      description: "Cute nature charm",
    },
    {
      id: "shape-flower-simple",
      name: "Florcita simple",
      emoji: "🌸",
      description: "Simple flower charm",
    },
    {
      id: "shape-daisy",
      name: "Margarita",
      emoji: "🌼",
      description: "Daisy charm",
    },
    {
      id: "shape-cupcake",
      name: "Cupcake",
      emoji: "🧁",
      description: "Cupcake charm",
    },
    {
      id: "shape-ice-cream",
      name: "Heladito",
      emoji: "🍦",
      description: "Ice cream charm",
    },
    {
      id: "shape-strawberry-cookie",
      name: "Galletita frutilla",
      emoji: "🍪",
      description: "Strawberry cookie charm",
    },
    {
      id: "shape-evil-eye",
      name: "Ojo turco",
      emoji: "🧿",
      description: "Evil eye charm",
    },
    {
      id: "shape-star",
      name: "Estrellita",
      emoji: "⭐",
      description: "Star charm",
    },
    {
      id: "shape-bell",
      name: "Campanita",
      emoji: "🔔",
      description: "Bell charm",
    },
    {
      id: "shape-lock",
      name: "Candadito",
      emoji: "🔒",
      description: "Lock charm",
    },
    {
      id: "shape-happy-key",
      name: "Llavecita cara feliz",
      emoji: "🔑",
      description: "Happy key charm",
    },
  ];

  return res.status(200).json({
    success: true,
    data: shapes,
    error: null,
  });
};

export const handleGetColors: RequestHandler = (req, res) => {
  const colors = [
    { id: "color-orange", name: "Orange", hex: "#FF6B35", rgb: "255, 107, 53" },
    { id: "color-green", name: "Green", hex: "#00B359", rgb: "0, 179, 89" },
    { id: "color-pink", name: "Pink", hex: "#FF1493", rgb: "255, 20, 147" },
    { id: "color-blue", name: "Blue", hex: "#0066FF", rgb: "0, 102, 255" },
    { id: "color-yellow", name: "Yellow", hex: "#FFD700", rgb: "255, 215, 0" },
    { id: "color-purple", name: "Purple", hex: "#9D4EDD", rgb: "157, 78, 221" },
    { id: "color-red", name: "Red", hex: "#FF0000", rgb: "255, 0, 0" },
    { id: "color-lime", name: "Lime", hex: "#CCFF00", rgb: "204, 255, 0" },
    { id: "color-cyan", name: "Cyan", hex: "#00D9FF", rgb: "0, 217, 255" },
    { id: "color-black", name: "Black", hex: "#000000", rgb: "0, 0, 0" },
  ];

  return res.status(200).json({
    success: true,
    data: colors,
    error: null,
  });
};
