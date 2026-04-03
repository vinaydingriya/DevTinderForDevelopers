
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

const connectDB = require("./config/database");

const users = [];

const skillsList = [
  "JavaScript", "React", "Vue.js", "Angular", "Svelte",
  "Node.js", "Express", "Django", "Flask", "FastAPI",
  "Python", "Java", "C++", "C#", "Go",
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Redis",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "Machine Learning", "TensorFlow", "PyTorch", "Scikit-learn", "OpenAI",
  "HTML", "CSS", "Tailwind", "Bootstrap", "Material UI",
  "GraphQL", "REST API", "WebSockets", "TypeScript", "Rust",
  "Blockchain", "Solidity", "Web3.js", "Ethers.js", "Smart Contracts",
  "DevOps", "CI/CD", "Git", "Jenkins", "GitHub Actions",
  "Testing", "Jest", "Mocha", "Pytest", "Selenium",
  "Next.js", "Nuxt", "Remix", "SvelteKit", "Astro",
  "Mobile Dev", "React Native", "Flutter", "SwiftUI", "Kotlin"
];

const interestsList = [
  "AI", "Web Dev", "Mobile Dev", "Blockchain", "Cloud",
  "DevOps", "Data Science", "Backend", "Frontend", "Full Stack",
  "Open Source", "Startups"
];

const firstNames = [
  "Alexvinay", "Jordan", "Casey", "Taylor", "Morgan", "Riley", "Avery", "Quinn",
  "Sam", "Pat", "Jesse", "Rehmaan", "Drew", "Blake", "Dakket", "Skylar",
  "Rowan", "Phoenix", "Sanky", "Sage", "Alex", "Chris", "Jordan", "Cameron",
  "Dakota", "Finley", "Kai", "Lennon", "Morgan", "River", "Sage", "Skyler",
  "Arjun", "Priya", "Arun", "Vikram", "Neha", "Deepak", "Raj", "Ananya"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis",
  "Patel", "Kumar", "Singh", "Sharma", "Gupta", "Yadav", "Joshi"
];

// Generate 100 users with variety
for (let i = 1; i <= 100; i++) {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  
  // Get 5-8 random unique skills (increased from 3-5)
  const numSkills = 5 + Math.floor(Math.random() * 4);
  const userSkills = [];
  const skillIndices = new Set();
  
  while (skillIndices.size < numSkills && skillIndices.size < skillsList.length) {
    skillIndices.add(Math.floor(Math.random() * skillsList.length));
  }
  
  skillIndices.forEach(idx => {
    userSkills.push(skillsList[idx]);
  });
  
  // Get 2-4 random interests
  const numInterests = 2 + Math.floor(Math.random() * 3);
  const userInterests = [];
  const interestIndices = new Set();
  
  while (interestIndices.size < numInterests) {
    interestIndices.add(Math.floor(Math.random() * interestsList.length));
  }
  
  interestIndices.forEach(idx => {
    userInterests.push(interestsList[idx]);
  });
  
  const bios = [
    `Full Stack Developer passionate about building amazing products 🚀`,
    `Backend specialist | Coffee enthusiast | Open source contributor`,
    `Frontend lover | UI/UX obsessed | Always learning 📚`,
    `DevOps engineer | Infrastructure as code | Automation advocate`,
    `ML enthusiast | Data science explorer | Python lover`,
    `Web3 developer | Blockchain curious | Crypto explorer`,
    `Mobile dev | Cross-platform solutions | Native performance`,
    `Startup founder | Building the future | Always hustling`,
    `Cloud architect | AWS certified | Enterprise solutions`,
    `Tech lead | Mentoring juniors | Software excellence`
  ];
  
  users.push({
    firstName: firstName,
    lastName: lastName,
    email: `user${i}@devtinder.com`,
    password: bcrypt.hashSync("Password@123", 10),
    age: 20 + (i % 35),
    gender: i % 2 === 0 ? "male" : "female",
    skills: userSkills,
    interests: userInterests,
    about: bios[i % bios.length],
    photoUrl: `https://randomuser.me/api/portraits/${
      i % 2 === 0 ? "men" : "women"
    }/${(i % 70) + 1}.jpg`,
    projectRequirements: `Looking for ${userInterests[0]} professionals to collaborate on exciting projects`
  });
}

const seedData = async () => {
  await connectDB();

  // Clear old data
  await User.deleteMany({});

  // Insert new data
  await User.insertMany(users);

  console.log("🔥 100 Users Inserted Successfully");
  process.exit();
};

seedData();