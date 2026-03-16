import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";

import Category from "./src/models/categoryModel.js";
import Room from "./src/models/roomModel.js";
import User from "./src/models/userModel.js";
import Gallary from "./src/models/galleryModel.js";
import BgImage from "./src/models/bgImageModel.js";
import BgImageSettings from "./src/models/bgImageSettingsModel.js";
import Destination from "./src/models/destinationModel.js";
import generateRoomId from "./src/utils/generateRoomId.js";

const MONGO_URI = process.env.MONGO_URI;

// ── Admin User ─────────────────────────────────────────────────────────────────
const adminData = {
  firstName: "Admin",
  lastName: "LuxeStay",
  email: "admin@gmail.com",
  phone: "0771234567",
  password: "admin@gmail.com",
  role: "Admin",
  isActive: true,
  isEmailVerified: true,
  profilePic: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
};

// ── Categories ─────────────────────────────────────────────────────────────────
const categories = [
  {
    name: "Standard Room",
    price: 8500,
    description: "A comfortable and well-appointed room perfect for solo travelers or couples. Features modern amenities and a cozy atmosphere for a relaxing stay.",
    features: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Mini Fridge", "24/7 Room Service"],
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    name: "Deluxe Room",
    price: 12000,
    description: "An upgraded room with premium furnishings, a city view, and enhanced amenities. Ideal for guests who want a little extra comfort and style.",
    features: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Mini Bar", "City View", "Bathtub", "24/7 Room Service"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    name: "Junior Suite",
    price: 18500,
    description: "A spacious suite with a separate living area, offering a luxurious retreat. Features premium bedding, a large bathroom, and stunning views.",
    features: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Full Mini Bar", "Ocean/Garden View", "Jacuzzi", "Living Area", "Complimentary Breakfast"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    name: "Executive Suite",
    price: 28000,
    description: "Our finest accommodation with a private lounge, butler service, and panoramic views. Designed for the most discerning guests seeking unparalleled luxury.",
    features: ["Free Wi-Fi", "Air Conditioning", "Home Theatre", "Full Bar", "Panoramic View", "Private Jacuzzi", "Separate Living & Dining", "Butler Service", "Complimentary Breakfast & Dinner"],
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    name: "Family Room",
    price: 15000,
    description: "Spacious and family-friendly room with extra beds and amenities tailored for families. Enjoy a comfortable stay with your loved ones in a warm, welcoming environment.",
    features: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Mini Fridge", "Extra Beds", "Kids Amenities", "Garden View", "24/7 Room Service"],
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
];

// ── Rooms per category ─────────────────────────────────────────────────────────
const roomsPerCategory = [
  { count: 3, maxGuests: 2, descriptions: [
    "A cozy standard room on the 2nd floor with garden view. Perfect for a relaxing getaway.",
    "Well-furnished standard room with pool-facing window on the 3rd floor.",
    "Bright and airy standard room on the 4th floor with modern decor.",
  ]},
  { count: 3, maxGuests: 2, descriptions: [
    "Deluxe room with stunning city skyline view, located on the 5th floor.",
    "Premium deluxe room with king-size bed and walk-in wardrobe on the 6th floor.",
    "Corner deluxe room offering dual city and garden views on the 7th floor.",
  ]},
  { count: 2, maxGuests: 3, descriptions: [
    "Junior suite with a private sitting area and ocean view on the 8th floor.",
    "Elegant junior suite with a king-size bed and landscaped garden view on the 9th floor.",
  ]},
  { count: 2, maxGuests: 3, descriptions: [
    "Our signature executive suite with full panoramic views and a private butler on the 10th floor.",
    "Luxurious executive suite with a private terrace and plunge pool on the 11th floor.",
  ]},
  { count: 2, maxGuests: 5, descriptions: [
    "Spacious family room with two queen beds and a dedicated kids corner on the 3rd floor.",
    "Large family room with connecting doors, perfect for a group, located on the 4th floor.",
  ]},
];

// photoSets[categoryIndex][roomIndex] = array of 3 photos for that specific room
const photoSets = [
  // Standard Room — 3 rooms, each with different photos
  [
    [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&auto=format&fit=crop",
    ],
  ],
  // Deluxe Room — 3 rooms
  [
    [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&auto=format&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800&auto=format&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&auto=format&fit=crop",
    ],
  ],
  // Junior Suite — 2 rooms
  [
    [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1578898887932-dce23a595ad4?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    ],
  ],
  // Executive Suite — 2 rooms
  [
    [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&auto=format&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1591088398332-8596b3462b4e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop",
    ],
  ],
  // Family Room — 2 rooms
  [
    [
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop",
    ],
  ],
];

// ── Gallery Images ─────────────────────────────────────────────────────────────
const galleryItems = [
  {
    name: "Hotel Lobby",
    description: "Our grand lobby welcomes guests with elegant decor and warm lighting.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    name: "Infinity Pool",
    description: "Enjoy a refreshing swim in our stunning infinity pool with panoramic views.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    name: "Fine Dining Restaurant",
    description: "Savor exquisite cuisine at our award-winning fine dining restaurant.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    name: "Luxury Spa",
    description: "Rejuvenate your body and mind at our world-class spa and wellness center.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop",
    isFeatured: false,
  },
  {
    name: "Beachfront View",
    description: "Wake up to breathtaking ocean views from our beachfront property.",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    name: "Conference Hall",
    description: "State-of-the-art conference facilities for business meetings and events.",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop",
    isFeatured: false,
  },
  {
    name: "Garden Terrace",
    description: "A serene garden terrace perfect for outdoor events and morning breakfasts.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
    isFeatured: false,
  },
  {
    name: "Fitness Center",
    description: "Stay in shape with our fully equipped modern fitness center open 24/7.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
    isFeatured: false,
  },
];

// ── Background Images ──────────────────────────────────────────────────────────
const bgImages = [
  {
    name: "Hero — Aerial Hotel View",
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop",
  },
  {
    name: "Rooms Page Banner",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&auto=format&fit=crop",
  },
  {
    name: "Pool Sunset",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&auto=format&fit=crop",
  },
  {
    name: "Dining Ambience",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop",
  },
  {
    name: "Beachfront Sunrise",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&auto=format&fit=crop",
  },
];

// ── Sri Lanka Destinations ─────────────────────────────────────────────────────
const destinations = [
  {
    name: "Sigiriya",
    location: "Matale District, Central Province, Sri Lanka",
    description: "Home to the iconic ancient rock fortress rising 200 metres above the surrounding plains. A UNESCO World Heritage Site offering breathtaking views and centuries of history.",
    image: "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800&auto=format&fit=crop",
    order: 1,
    isFeatured: true,
  },
  {
    name: "Ella",
    location: "Badulla District, Uva Province, Sri Lanka",
    description: "A charming hill-country village surrounded by lush tea plantations, misty mountains, and stunning waterfalls. Famous for the Nine Arch Bridge and Little Adam's Peak.",
    image: "https://images.unsplash.com/photo-1586266599839-e7426f1ee20d?w=800&auto=format&fit=crop",
    order: 2,
    isFeatured: true,
  },
  {
    name: "Galle",
    location: "Southern Province, Sri Lanka",
    description: "A beautifully preserved Dutch colonial fort town on the southwest coast. Stroll cobblestone streets, explore boutique shops, and enjoy panoramic ocean sunsets from the ramparts.",
    image: "https://images.unsplash.com/photo-1580977251946-7fd7699e1134?w=800&auto=format&fit=crop",
    order: 3,
    isFeatured: true,
  },
  {
    name: "Kandy",
    location: "Central Province, Sri Lanka",
    description: "Sri Lanka's cultural capital and home to the sacred Temple of the Tooth Relic. Surrounded by misty hills, the Kandy Lake, and vibrant Kandyan dance performances.",
    image: "https://images.unsplash.com/photo-1567606404787-17130cfb6f30?w=800&auto=format&fit=crop",
    order: 4,
    isFeatured: true,
  },
  {
    name: "Mirissa",
    location: "Southern Province, Sri Lanka",
    description: "A tranquil beach paradise known for whale watching, golden sands, and turquoise waters. One of Sri Lanka's most beautiful coastal spots, perfect for relaxation and surfing.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
    order: 5,
    isFeatured: true,
  },
  {
    name: "Trincomalee",
    location: "Eastern Province, Sri Lanka",
    description: "Home to one of the world's finest natural harbours and pristine beaches like Nilaveli. Famous for diving, snorkelling, and swimming alongside dolphins and sea turtles.",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop",
    order: 6,
    isFeatured: false,
  },
  {
    name: "Nuwara Eliya",
    location: "Central Province, Sri Lanka",
    description: "Known as 'Little England', this cool highland retreat sits at 1,868 metres above sea level. Endless tea estates, colonial bungalows, and crisp mountain air await.",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop",
    order: 7,
    isFeatured: false,
  },
  {
    name: "Yala National Park",
    location: "Southern & Uva Provinces, Sri Lanka",
    description: "Sri Lanka's most visited wildlife reserve, home to the world's highest density of leopards. Safari drives reveal elephants, sloth bears, crocodiles, and abundant birdlife.",
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&auto=format&fit=crop",
    order: 8,
    isFeatured: false,
  },
  {
    name: "Colombo",
    location: "Western Province, Sri Lanka",
    description: "Sri Lanka's vibrant commercial capital blending modern skyscrapers with colonial architecture. Explore bustling markets, world-class dining, and the scenic Galle Face promenade.",
    image: "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800&auto=format&fit=crop",
    order: 9,
    isFeatured: false,
  },
  {
    name: "Polonnaruwa",
    location: "North Central Province, Sri Lanka",
    description: "Sri Lanka's second ancient capital, featuring remarkably well-preserved ruins of royal palaces, Buddhist temples, and the magnificent Gal Vihara rock sculptures.",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop",
    order: 10,
    isFeatured: false,
  },
];

// BgImageSettings — section key → image URL mapping used by the frontend
const bgImageSections = {
  homeHero:       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop",
  homeRooms:      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&auto=format&fit=crop",
  homeCategories: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop",
  homeCta:        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&auto=format&fit=crop",
  rooms:          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&auto=format&fit=crop",
  gallery:        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&auto=format&fit=crop",
  about:          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&auto=format&fit=crop",
  contact:        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop",
};

// ── Seed ───────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // ── 1. Admin user ────────────────────────────────────────────────────────
    await User.deleteMany({ role: "Admin" });
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const admin = await User.create({ ...adminData, password: hashedPassword });
    console.log(`👤 Admin created`);
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Password : ${adminData.password}\n`);

    // ── 2. Categories & Rooms ────────────────────────────────────────────────
    await Category.deleteMany({});
    await Room.deleteMany({});
    const insertedCategories = await Category.insertMany(categories);
    console.log(`📦 ${insertedCategories.length} categories inserted`);

    let roomCount = 0;
    for (let i = 0; i < insertedCategories.length; i++) {
      const cat = insertedCategories[i];
      const { count, maxGuests, descriptions } = roomsPerCategory[i];
      for (let j = 0; j < count; j++) {
        const roomID = await generateRoomId();
        await Room.create({
          roomID,
          category: cat._id,
          maxGuests,
          availability: true,
          photos: photoSets[i][j],
          description: descriptions[j],
        });
        roomCount++;
      }
    }
    console.log(`🛏️  ${roomCount} rooms inserted\n`);

    // ── 3. Gallery ───────────────────────────────────────────────────────────
    await Gallary.deleteMany({});
    const insertedGallery = await Gallary.insertMany(galleryItems);
    console.log(`🖼️  ${insertedGallery.length} gallery images inserted`);

    // ── 4. Background Images ─────────────────────────────────────────────────
    await BgImage.deleteMany({});
    const insertedBgImages = await BgImage.insertMany(bgImages);
    console.log(`🌄 ${insertedBgImages.length} background images inserted`);

    // ── 5. Destinations ──────────────────────────────────────────────────────
    await Destination.deleteMany({});
    const insertedDestinations = await Destination.insertMany(destinations);
    console.log(`📍 ${insertedDestinations.length} destinations inserted`);

    // BgImageSettings upsert
    await BgImageSettings.findOneAndUpdate(
      {},
      { sections: bgImageSections },
      { upsert: true, new: true }
    );
    console.log(`⚙️  BgImageSettings updated (${Object.keys(bgImageSections).length} sections)\n`);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log("═".repeat(45));
    console.log("✅  SEED COMPLETE");
    console.log("═".repeat(45));
    console.log(`  Admin       : ${admin.email} / ${adminData.password}`);
    console.log(`  Categories  : ${insertedCategories.length}`);
    console.log(`  Rooms       : ${roomCount}`);
    console.log(`  Gallery     : ${insertedGallery.length} images`);
    console.log(`  BG Images   : ${insertedBgImages.length} images`);
    console.log(`  Destinations: ${insertedDestinations.length}`);
    console.log("═".repeat(45));

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
