import type { Experience, StoryLocation } from "./types";

export const EXPERIENCES: Experience[] = [
  {
    id: "mountains",
    title: "კავკასიონი",
    subtitle: "The Caucasus",
    description:
      "Ancient peaks where legends breathe. Trek through valleys older than memory, where shepherds still sing songs passed down through centuries.",
    color: "#2d5a4a",
  },
  {
    id: "wine",
    title: "ღვინო",
    subtitle: "Wine Heritage",
    description:
      "8,000 years of winemaking in clay qvevri buried beneath the earth. Taste the soul of Georgia in every amber drop of natural wine.",
    color: "#8b4f39",
  },
  {
    id: "coast",
    title: "შავი ზღვა",
    subtitle: "Black Sea Coast",
    description:
      "Where subtropical gardens meet ancient fortresses. Dance the night away in Batumi, wake to waves older than the city.",
    color: "#1a4d5c",
  },
  {
    id: "cuisine",
    title: "სუფრა",
    subtitle: "Sacred Table",
    description:
      "Supra is not a meal—it's a ritual. Khinkali, khachapuri, and stories that last until sunrise. Food is love, and love is endless.",
    color: "#c73e1d",
  },
  {
    id: "culture",
    title: "ტრადიცია",
    subtitle: "Living Traditions",
    description:
      "Polyphonic songs that echo through monasteries. Dance that defies gravity. A culture that never forgot who it is.",
    color: "#4a2c2a",
  },
];

export const STORY_LOCATIONS: StoryLocation[] = [
  {
    id: "tbilisi",
    name: "თბილისი",
    nameEn: "Tbilisi",
    coordinates: { longitude: 44.79, latitude: 41.69 },
    zoom: 12,
    pitch: 55,
    bearing: -45,
    story:
      "Where ancient sulfur baths meet Soviet brutalism. Your journey begins in the beating heart of Georgia.",
    icon: "",
    color: "#8b4f39",
    elevation: "500m",
    population: "1.2M",
    distance: "0 km",
  },
  {
    id: "kazbegi",
    name: "ყაზბეგი",
    nameEn: "Kazbegi",
    coordinates: { longitude: 44.65, latitude: 42.66 },
    zoom: 11,
    pitch: 70,
    bearing: -30,
    story:
      "5,047 meters of pure legend. Gergeti Trinity Church watches over valleys where gods once walked.",
    icon: "",
    color: "#2d5a4a",
    elevation: "1,750m",
    population: "3,800",
    distance: "165 km N",
  },
  {
    id: "kakheti",
    name: "კახეთი",
    nameEn: "Kakheti Wine Region",
    coordinates: { longitude: 45.7, latitude: 41.9 },
    zoom: 10,
    pitch: 45,
    bearing: 30,
    story:
      "8,000 years of wine buried in clay. Every vineyard tells a story older than written history.",
    icon: "",
    color: "#8b4f39",
    elevation: "400m",
    population: "Regional",
    distance: "110 km E",
  },
  {
    id: "batumi",
    name: "ბათუმი",
    nameEn: "Batumi",
    coordinates: { longitude: 41.65, latitude: 41.65 },
    zoom: 11,
    pitch: 50,
    bearing: 180,
    story:
      "Where palm trees meet the Black Sea. Dance until sunrise in Georgia's subtropical paradise.",
    icon: "",
    color: "#1a4d5c",
    elevation: "Sea level",
    population: "170K",
    distance: "370 km SW",
  },
  {
    id: "svaneti",
    name: "სვანეთი",
    nameEn: "Svaneti",
    coordinates: { longitude: 43.05, latitude: 43.05 },
    zoom: 10,
    pitch: 65,
    bearing: -10,
    story:
      "Medieval towers pierce the clouds. A kingdom frozen in time, accessible only to the brave.",
    icon: "",
    color: "#4a2c2a",
    elevation: "1,500m",
    population: "14K",
    distance: "450 km NW",
  },
];
