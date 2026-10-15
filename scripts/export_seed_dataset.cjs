const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'generate_fresh_dataset.cjs'), 'utf-8');
const fn = new Function('require', '__dirname', code + '\nreturn { users, gigs, projects, orders, messages, proposals, reviews };');
const data = fn(require, __dirname);

// Add usr_ fixtures for compatibility
const usrFixtures = [
  {
    id: 'usr_1',
    name: 'Super Administrator',
    username: 'admin',
    email: 'admin@workperhour.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    title: 'WorkPerHour Head of Trust & Safety',
    rating: 5.0,
    reviewsCount: 48,
    hourlyRate: 150,
    earned: 25000,
    completedJobs: 112,
    bio: 'Platform super administrator overseeing marketplace integrity, escrow disputes, and verification.',
    skills: ['Platform Management', 'Escrow Resolution', 'Customer Success'],
    status: 'active',
    verified: true,
    walletBalance: 10000,
    createdAt: '2026-01-01'
  },
  {
    id: 'usr_3',
    name: 'Marcus Vance (Outsider)',
    username: 'marcus_vance',
    email: 'marcus@vance.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    title: 'Senior DevOps & Backend Engineer',
    rating: 4.9,
    reviewsCount: 19,
    hourlyRate: 90,
    earned: 4200,
    completedJobs: 18,
    bio: 'Experienced cloud architect specializing in AWS, Docker, Kubernetes, and secure payments.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Node.js', 'PostgreSQL'],
    status: 'active',
    verified: true,
    walletBalance: 2500,
    createdAt: '2026-01-20'
  },
  {
    id: 'usr_4',
    name: 'Aisha Patel',
    username: 'aisha_patel',
    email: 'aisha@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    title: 'Senior UI/UX Designer & Figma Specialist',
    rating: 5.0,
    reviewsCount: 34,
    hourlyRate: 75,
    earned: 6800,
    completedJobs: 29,
    bio: 'Creative product designer crafting high-converting web apps, SaaS dashboards, and design systems in Figma.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'Mobile Apps'],
    status: 'active',
    verified: true,
    walletBalance: 3200,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr_6',
    name: 'Sarah Jenkins',
    username: 'sarah_jenkins',
    email: 'sarah@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    title: 'Product Manager & SaaS Founder',
    rating: 4.9,
    reviewsCount: 15,
    hourlyRate: 80,
    earned: 12000,
    completedJobs: 22,
    bio: 'Tech founder hiring top talent for web and mobile software development.',
    skills: ['Product Strategy', 'Agile', 'Scrum', 'Market Research'],
    status: 'active',
    verified: true,
    walletBalance: 5000,
    createdAt: '2026-02-15'
  }
];

const allUsers = [...data.users];
for (const u of usrFixtures) {
  if (!allUsers.some(x => x.id === u.id)) {
    allUsers.push(u);
  }
}

const ord2 = {
  id: 'ord_2',
  title: 'Design Modern Figma UI/UX for SaaS Platforms and Mobile Apps',
  amount: 350,
  buyerId: 'usr_6',
  sellerId: 'usr_4',
  status: 'funded_in_escrow',
  createdAt: '2026-03-01T00:00:00.000Z',
  dueDate: '2026-03-20T00:00:00.000Z',
  requirements: 'Design Figma UI/UX for SaaS Platforms and Mobile Apps',
  deliverables: 'Figma master files and assets',
  escrowProtectionStartDate: '2026-03-01',
  escrowProtectionEndDate: '2026-03-25'
};

const allOrders = [...data.orders];
if (!allOrders.some(o => o.id === 'ord_2')) {
  allOrders.push(ord2);
}

const tsContent = `// Automatically generated complete seed dataset for WorkPerHour
import { UserAccount, Gig, Project, Proposal, Order, Review, Message } from '../types';

export const SEED_USERS: UserAccount[] = ${JSON.stringify(allUsers, null, 2)};

export const SEED_GIGS: Gig[] = ${JSON.stringify(data.gigs, null, 2)};

export const SEED_PROJECTS: Project[] = ${JSON.stringify(data.projects, null, 2)};

export const SEED_PROPOSALS: Proposal[] = ${JSON.stringify(data.proposals, null, 2)};

export const SEED_ORDERS: Order[] = ${JSON.stringify(allOrders, null, 2)};

export const SEED_REVIEWS: Review[] = ${JSON.stringify(data.reviews, null, 2)};

export const SEED_MESSAGES: Message[] = ${JSON.stringify(data.messages, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/completeSeedDataset.ts'), tsContent, 'utf-8');
console.log('Successfully generated src/data/completeSeedDataset.ts with full dataset!');
