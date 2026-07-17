import { Category, ProfessionalProfile, Coupon } from "./types";

export const CATEGORIES: Category[] = [
  { id: "cleaning", name: "Home Cleaning", icon: "Brush", description: "Deep cleaning, dusting, disinfection, kitchen, and bathroom sanitation", basePrice: 49 },
  { id: "electrician", name: "Electrician", icon: "Zap", description: "Wiring, switchboard repair, appliance installation, and troubleshooting", basePrice: 39 },
  { id: "plumbing", name: "Plumber", icon: "Droplets", description: "Leaking pipes, tap repair, drain cleaning, and bathroom fitting", basePrice: 45 },
  { id: "tutor", name: "Tutor & Educator", icon: "BookOpen", description: "School tuition, music classes, languages, and STEM tutoring", basePrice: 35 },
  { id: "beauty", name: "Salon & Spa", icon: "Flower", description: "Facials, haircuts, waxing, hair spa, massage, and bridal styling", basePrice: 59 },
  { id: "carpentry", name: "Carpenter", icon: "Hammer", description: "Furniture repair, assembly, kitchen cabinets, and custom wood works", basePrice: 42 },
  { id: "appliances", name: "AC & Appliance Repair", icon: "Cpu", description: "AC servicing, fridge, washing machine, and microwave repair", basePrice: 49 },
  { id: "painting", name: "Painter", icon: "Paintbrush", description: "Wall painting, waterproofing, wall textures, and exterior coating", basePrice: 99 },
  { id: "gardening", name: "Gardener", icon: "Leaf", description: "Lawn mowing, plant potting, weed removal, and garden styling", basePrice: 29 },
  { id: "pestcontrol", name: "Pest Control", icon: "ShieldAlert", description: "Termite, cockroach, rodent control, and organic sanitation", basePrice: 65 },
  { id: "techsupport", name: "Laptop & Tech Repair", icon: "Laptop", description: "Software install, screen replacement, virus clean, and custom PCs", basePrice: 49 },
  { id: "photography", name: "Photographer", icon: "Camera", description: "Event coverage, portrait sessions, products, and cinematic editing", basePrice: 120 },
  { id: "driver", name: "Professional Driver", icon: "Car", description: "Outstation drives, city trips, monthly chauffeurs, and luxury transport", basePrice: 25 },
  { id: "fitness", name: "Fitness & Yoga", icon: "Activity", description: "Personal workouts, weight loss, yoga flows, and diet consultations", basePrice: 40 },
  { id: "petcare", name: "Pet Grooming & Care", icon: "Heart", description: "Dog walking, pet washing, haircuts, nail trimming, and boarding", basePrice: 35 }
];

const staticProfessionals: ProfessionalProfile[] = [
  {
    id: "pro_1",
    userId: "user_pro_1",
    name: "Arjun Sharma",
    category: "cleaning",
    title: "Master Home Sanitizer & Deep Cleaning Expert",
    bio: "Over 8 years of certified deep cleaning experience. Specializing in high-end villas, eco-friendly sanitation materials, and luxury fabric upholstery restoration. Highly reliable, detail-oriented, and client-first.",
    rating: 4.9,
    reviewCount: 142,
    experienceYears: 8,
    hourlyRate: 55,
    city: "Bengaluru",
    isVerified: true,
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
    portfolio: [
      { id: "p1_1", title: "Luxury Penthouse Cleaning", imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&auto=format&fit=crop&q=80", description: "Completed full post-renovation sanitation for a 5000 sqft premium duplex." },
      { id: "p1_2", title: "Organic Kitchen Sanitation", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80", description: "Heavy grease removal using non-toxic citrus-based organic solutions." }
    ],
    availability: [
      { day: "Monday", slots: ["09:00 AM", "11:00 AM", "02:00 PM"] },
      { day: "Wednesday", slots: ["10:00 AM", "01:00 PM", "04:00 PM"] },
      { day: "Friday", slots: ["09:00 AM", "02:00 PM", "05:00 PM"] }
    ],
    skills: ["Eco-friendly Sanitation", "Upholstery Steaming", "Post-Construction Deep Clean", "Tile Restoration"],
    certificates: ["Certified Bio-Sanitation Expert", "Urban Chemical Management License"],
    analytics: {
      totalEarnings: 8450,
      completedJobs: 138,
      profileViews: 1240
    }
  },
  {
    id: "pro_2",
    userId: "user_pro_2",
    name: "Vikram Raj",
    category: "electrician",
    title: "Licensed Industrial & Smart Home Electrician",
    bio: "BS in Electrical Safety. Specializing in smart home automation setups, server rack cabling, switchboard overhauls, and general home diagnostics. Emergency support available 24/7.",
    rating: 4.8,
    reviewCount: 96,
    experienceYears: 6,
    hourlyRate: 45,
    city: "Mumbai",
    isVerified: true,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    portfolio: [
      { id: "p2_1", title: "Smart Home Node Overhaul", imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&auto=format&fit=crop&q=80", description: "Configured intelligent lighting panels, voice integrations, and secure breaker nodes." }
    ],
    availability: [
      { day: "Tuesday", slots: ["08:00 AM", "10:00 AM", "02:00 PM"] },
      { day: "Thursday", slots: ["09:00 AM", "12:00 PM", "03:00 PM"] },
      { day: "Saturday", slots: ["11:00 AM", "03:00 PM", "06:00 PM"] }
    ],
    skills: ["Smart Home Automation", "Breaker Panel Diagnostic", "Energy-Efficient LED Layouts", "Short Circuit Repair"],
    certificates: ["National Safety Council Electrical Certification", "SmartHome Automation Integrator"],
    analytics: {
      totalEarnings: 5920,
      completedJobs: 92,
      profileViews: 810
    }
  },
  {
    id: "pro_3",
    userId: "user_pro_3",
    name: "Dr. Ananya Rao",
    category: "tutor",
    title: "Senior STEM Educator & Mathematics PhD",
    bio: "Passionate educator with a doctorate in applied mathematics. Helping school and college students master complex algebra, calculus, physics, and computer science logic. 100% customized visual-first teaching methods.",
    rating: 5.0,
    reviewCount: 188,
    experienceYears: 10,
    hourlyRate: 60,
    city: "Bengaluru",
    isVerified: true,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    portfolio: [
      { id: "p3_1", title: "Visual Calculus Class", imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&auto=format&fit=crop&q=80", description: "Special math bootcamp using dynamic visual software to demonstrate integral calculus." }
    ],
    availability: [
      { day: "Monday", slots: ["04:00 PM", "06:00 PM", "08:00 PM"] },
      { day: "Tuesday", slots: ["04:00 PM", "06:00 PM", "08:00 PM"] },
      { day: "Wednesday", slots: ["04:00 PM", "06:00 PM", "08:00 PM"] },
      { day: "Thursday", slots: ["04:00 PM", "06:00 PM", "08:00 PM"] },
      { day: "Friday", slots: ["04:00 PM", "06:00 PM", "08:00 PM"] }
    ],
    skills: ["Differential Calculus", "AP Physics Prep", "Python Coding Logic", "Conceptual Pedagogy"],
    certificates: ["State University Teaching Excellence Award", "Certified STEM Instructor"],
    analytics: {
      totalEarnings: 15400,
      completedJobs: 172,
      profileViews: 2450
    }
  },
  {
    id: "pro_4",
    userId: "user_pro_4",
    name: "Ramesh Kumar",
    category: "plumbing",
    title: "Precision Hydraulic Specialist & Leak Detection Expert",
    bio: "Certified plumbing engineer with extensive experience in luxury high-rise hydraulics, central water heating circuits, smart sensor plumbing, and non-destructive modern leak diagnosis.",
    rating: 4.7,
    reviewCount: 74,
    experienceYears: 12,
    hourlyRate: 50,
    city: "Delhi",
    isVerified: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    portfolio: [],
    availability: [
      { day: "Monday", slots: ["10:00 AM", "01:00 PM"] },
      { day: "Tuesday", slots: ["09:00 AM", "04:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "03:00 PM"] }
    ],
    skills: ["Acoustic Leak Detection", "Hydraulic Pressure Calibrations", "Smart Sensor Fitting", "Sump Pump Engineering"],
    certificates: ["National Hydraulic Association Master Plumber License"],
    analytics: {
      totalEarnings: 4200,
      completedJobs: 71,
      profileViews: 590
    }
  },
  {
    id: "pro_5",
    userId: "user_pro_5",
    name: "Sophia Lorenz",
    category: "beauty",
    title: "Luxury Bridal Hairstylist & Aesthetic Therapist",
    bio: "Trained at the London Academy of Cosmetics. Offering holistic spa treatments, celebrity-style cuts, custom clinical facials, and premium aromatherapy massages at the comfort of your private space.",
    rating: 4.9,
    reviewCount: 110,
    experienceYears: 7,
    hourlyRate: 70,
    city: "Bengaluru",
    isVerified: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    portfolio: [
      { id: "p5_1", title: "Aromatherapy Lounge setup", imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop&q=80", description: "Created an immersive wellness studio in client's residential conservatory." }
    ],
    availability: [
      { day: "Friday", slots: ["10:00 AM", "01:00 PM", "04:00 PM", "07:00 PM"] },
      { day: "Saturday", slots: ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM"] },
      { day: "Sunday", slots: ["11:00 AM", "02:00 PM", "05:00 PM"] }
    ],
    skills: ["Aromatherapy Massage", "Bridal Airbrush Makeup", "Gold-Infused Facial Therapy", "Organic Hair Treatments"],
    certificates: ["CIDESCO Global Beauty Diploma", "Certified Organic Spa Practitioner"],
    analytics: {
      totalEarnings: 9800,
      completedJobs: 105,
      profileViews: 1480
    }
  },
  {
    id: "pro_6",
    userId: "user_pro_6",
    name: "Kabir Dev",
    category: "carpentry",
    title: "Modern Modular Furniture Joiner & Wood Artist",
    bio: "Passionate woodworker specializing in customized modular kitchens, hardwood repairs, designer bookshelf joinery, and restoration of antique wooden heirlooms.",
    rating: 4.6,
    reviewCount: 48,
    experienceYears: 5,
    hourlyRate: 40,
    city: "Mumbai",
    isVerified: false,
    avatar: "https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?w=150&auto=format&fit=crop&q=80",
    portfolio: [
      { id: "p6_1", title: "Teak Dining Table Revitalized", imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&auto=format&fit=crop&q=80", description: "Stripped, hand-sanded, and stained a vintage 1970s family dining table." }
    ],
    availability: [
      { day: "Wednesday", slots: ["09:00 AM", "02:00 PM"] },
      { day: "Thursday", slots: ["09:00 AM", "02:00 PM"] },
      { day: "Saturday", slots: ["10:00 AM", "01:00 PM", "04:00 PM"] }
    ],
    skills: ["Precision Joint Engineering", "Teak & Mahogany Restoration", "Custom Bookshelf Fitting", "Soft-Close Cabinet Alignment"],
    certificates: ["National Woodcraft Guild Master Joiner Certification"],
    analytics: {
      totalEarnings: 2900,
      completedJobs: 43,
      profileViews: 320
    }
  },
  {
    id: "pro_7",
    userId: "user_pro_7",
    name: "Karan Johar",
    category: "appliances",
    title: "Dual-Inverter HVAC Diagnostic Expert",
    bio: "Specializing in precision servicing and repair of multi-brand split and central ACs, variable refrigerant heat loops, modern sensor fridges, and front-load washing machines. Prompt 1-hour resolution.",
    rating: 4.8,
    reviewCount: 82,
    experienceYears: 9,
    hourlyRate: 48,
    city: "Delhi",
    isVerified: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    portfolio: [],
    availability: [
      { day: "Monday", slots: ["08:00 AM", "12:00 PM", "04:00 PM"] },
      { day: "Wednesday", slots: ["08:00 AM", "12:00 PM", "04:00 PM"] },
      { day: "Friday", slots: ["08:00 AM", "12:00 PM", "04:00 PM"] }
    ],
    skills: ["Dual-Inverter Diagnosis", "Freon Gas Recharging", "Thermostat Calibrations", "PCB Board Micro-soldering"],
    certificates: ["HVAC Alliance Master Servicing License"],
    analytics: {
      totalEarnings: 6100,
      completedJobs: 80,
      profileViews: 710
    }
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: "NAMMAPRO20", discountPercent: 20, maxDiscount: 30, minBookingValue: 50, description: "Get 20% OFF on your first booking up to $30!" },
  { code: "DEEPCLEAN", discountPercent: 15, maxDiscount: 50, minBookingValue: 100, description: "Save 15% on deep cleaning services over $100." },
  { code: "G1FESTIVE", discountPercent: 25, maxDiscount: 40, minBookingValue: 80, description: "Special G1AI assistant celebratory offer! Save 25%." }
];

export const CITIES = ["Bengaluru", "Mumbai", "Delhi", "Chennai", "Kolkata", "Hyderabad", "Pune", "Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar"];

const FIRST_NAMES = ["Amit", "Priya", "Vikram", "Ananya", "Rahul", "Neha", "Arjun", "Sneha", "Karan", "Pooja", "Sanjay", "Deepa", "Rohan", "Meera", "Kabir", "Aditya", "Ritu", "Sameer", "Tanvi", "Kavita", "Siddharth", "Preeti", "Rajesh", "Snehal", "Tarun"];
const LAST_NAMES = ["Sharma", "Kumar", "Patel", "Rao", "Nair", "Iyer", "Mehta", "Singh", "Reddy", "Gowda", "Joshi", "Sen", "Das", "Banerjee", "Gupta", "Venkatesh", "Choudhury", "Pillai", "Deshmukh", "Kulkarni"];
const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
];

const generatedProfessionals: ProfessionalProfile[] = [];
let seedCounter = 100;

CATEGORIES.forEach((cat) => {
  CITIES.forEach((city, cityIdx) => {
    seedCounter++;
    const name = `${FIRST_NAMES[(cityIdx + seedCounter) % FIRST_NAMES.length]} ${LAST_NAMES[(cityIdx * 3 + seedCounter) % LAST_NAMES.length]}`;
    const rate = cat.basePrice + ((seedCounter % 5) * 5);
    const rating = parseFloat((4.5 + ((seedCounter % 6) * 0.1)).toFixed(1));
    const experience = 3 + (seedCounter % 10);
    const id = `pro_gen_${cat.id}_${city.toLowerCase().replace(/\s+/g, "_")}`;
    const avatar = AVATARS[seedCounter % AVATARS.length];
    
    generatedProfessionals.push({
      id,
      userId: `user_gen_${seedCounter}`,
      name,
      category: cat.id,
      title: `Expert ${cat.name} Specialist`,
      bio: `Highly skilled and background-verified expert providing premium ${cat.name.toLowerCase()} services in ${city}. Over ${experience} years of dedicated home-care experience with multiple certifications.`,
      rating,
      reviewCount: 15 + (seedCounter % 40),
      experienceYears: experience,
      hourlyRate: rate,
      city,
      isVerified: true,
      avatar,
      portfolio: [
        {
          id: `p_${id}_1`,
          title: `Successful ${cat.name} Project`,
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80",
          description: `Professional execution of comprehensive ${cat.name.toLowerCase()} work in residential spaces.`
        }
      ],
      availability: [
        { day: "Monday", slots: ["09:00 AM", "12:00 PM", "03:00 PM"] },
        { day: "Wednesday", slots: ["10:00 AM", "01:00 PM", "04:00 PM"] },
        { day: "Friday", slots: ["09:00 AM", "02:00 PM", "05:00 PM"] }
      ],
      skills: [`Premium ${cat.name}`, "Client Relations", "Safety Standards Compliance"],
      certificates: [`Certified ${cat.name} Practitioner`, "NammaPro Vetted Professional"],
      analytics: {
        totalEarnings: rate * 35,
        completedJobs: 25 + (seedCounter % 15),
        profileViews: 120 + (seedCounter % 80)
      }
    });
  });
});

export const INITIAL_PROFESSIONALS: ProfessionalProfile[] = [
  ...staticProfessionals,
  ...generatedProfessionals
];
