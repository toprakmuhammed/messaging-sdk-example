import React, { useState, useEffect } from "react";
import {
  Wallet,
  Briefcase,
  Search,
  PlusCircle,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  FileLock2,
  Coins,
  Globe2,
  User,
  ChevronRight,
  UploadCloud,
} from "lucide-react";

// --- Types & Mock Data ---

type JobStatus = "OPEN" | "FILLED";

interface Application {
  candidate: string;
  blobId: string; // Walrus Blob ID
  timestamp: number;
}

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  salary: number | null; // Option<u64> equivalent
  tags: string[];
  status: JobStatus;
  employerAddress: string;
  applications: Application[];
  postedAt: number;
}

// Mock Initial Data (Global Content)
const INITIAL_JOBS: Job[] = [
  {
    id: "0x123...abc",
    title: "Senior Rust Developer",
    company: "Mysten Labs",
    description:
      "We are looking for a Move expert to build the next generation of DeFi protocols on Sui. Experience with Sui Move object models is a must.",
    salary: 5000,
    tags: ["Remote", "DeFi", "Move"],
    status: "OPEN",
    employerAddress: "0xEmployer1",
    applications: [],
    postedAt: Date.now() - 10000000,
  },
  {
    id: "0x456...def",
    title: "Frontend Engineer (Web3)",
    company: "WeWork DAO",
    description:
      "Build high-performance interfaces using React and Sui Typescript SDK. Familiarity with Walrus protocol is a plus.",
    salary: 3000,
    tags: ["React", "TypeScript", "Walrus"],
    status: "OPEN",
    employerAddress: "0xEmployer2",
    applications: [
      {
        candidate: "0xCandidate1",
        blobId: "blob_xyz123",
        timestamp: Date.now(),
      },
    ],
    postedAt: Date.now() - 5000000,
  },
  {
    id: "0x789...ghi",
    title: "Smart Contract Auditor",
    company: "SecureSui",
    description: "Audit complex Move modules for security vulnerabilities.",
    salary: null, // Negotiable
    tags: ["Audit", "Security"],
    status: "FILLED",
    employerAddress: "0xEmployer3",
    applications: [],
    postedAt: Date.now() - 20000000,
  },
];

// --- Components ---

export default function LandingPage() {
  const [view, setView] = useState<
    "HOME" | "JOBS" | "CREATE" | "PROFILE" | "JOB_DETAIL"
  >("HOME");
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Simulation states
  const [isWalrusUploading, setIsWalrusUploading] = useState(false);

  const connectWallet = () => {
    // Simulate Sui Wallet Connection
    setTimeout(() => {
      setIsConnected(true);
      setWalletAddress("0x71C...9A2");
    }, 800);
  };

  const navigateTo = (v: typeof view) => setView(v);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B0E14]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigateTo("HOME")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Briefcase className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              WeWork
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button
              onClick={() => navigateTo("JOBS")}
              className={`hover:text-cyan-400 transition-colors ${view === "JOBS" ? "text-cyan-400" : ""}`}
            >
              Jobs
            </button>
            <button
              onClick={() => navigateTo("CREATE")}
              className={`hover:text-cyan-400 transition-colors ${view === "CREATE" ? "text-cyan-400" : ""}`}
            >
              Post a Job
            </button>
            <button className="hover:text-cyan-400 transition-colors">
              Talent
            </button>
          </div>

          <div>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white px-5 py-2.5 rounded-lg transition-all font-medium"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 pl-3 pr-1 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-slate-300">
                  {walletAddress}
                </span>
                <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                  W
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Router */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === "HOME" && <HeroSection navigateTo={navigateTo} />}
        {view === "JOBS" && (
          <JobBoard
            jobs={jobs}
            onJobClick={(job) => {
              setSelectedJob(job);
              navigateTo("JOB_DETAIL");
            }}
          />
        )}
        {view === "CREATE" && (
          <CreateJobForm
            onJobPost={(job) => {
              setJobs([job, ...jobs]);
              navigateTo("JOBS");
            }}
            isConnected={isConnected}
          />
        )}
        {view === "JOB_DETAIL" && selectedJob && (
          <JobDetail
            job={selectedJob}
            onBack={() => navigateTo("JOBS")}
            isWalrusUploading={isWalrusUploading}
            setUploading={setIsWalrusUploading}
          />
        )}
      </main>
    </div>
  );
}

// --- Sub-Components ---

function HeroSection({ navigateTo }: { navigateTo: (v: any) => void }) {
  return (
    <div className="relative py-20 text-center animate-in fade-in duration-700">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] -z-10"></div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-cyan-400 text-sm font-medium mb-8 animate-fade-in-up">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        Live on Sui Network
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
        Build the Future of <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
          Web3 Work
        </span>
      </h1>

      <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        WeWork is a decentralized, secure, and transparent job platform running
        on the Sui blockchain. Your data is safe with Walrus.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => navigateTo("JOBS")}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/20 transition-all transform hover:scale-[1.02]"
        >
          Explore Jobs
        </button>
        <button
          onClick={() => navigateTo("CREATE")}
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all"
        >
          Post a Job
        </button>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: ShieldCheck,
            title: "Smart Contract Secured",
            desc: "Payments are locked in a Sui Move escrow vault.",
          },
          {
            icon: FileLock2,
            title: "Walrus & Seal Integration",
            desc: "Files are encrypted and stored on a decentralized network.",
          },
          {
            icon: Coins,
            title: "0% Commission",
            desc: "No platform fees, only standard network gas.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl text-left hover:border-cyan-500/30 transition-colors group"
          >
            <item.icon className="w-10 h-10 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobBoard({
  jobs,
  onJobClick,
}: {
  jobs: Job[];
  onJobClick: (j: Job) => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Open Positions</h2>
          <p className="text-slate-400">
            The latest opportunities in the Sui ecosystem.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search position or tag..."
            className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-lg w-64 focus:outline-none focus:border-cyan-500/50"
          />
          <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onJobClick(job)}
            className="group relative bg-slate-900/40 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 cursor-pointer transition-all hover:bg-slate-900/60 overflow-hidden"
          >
            {job.status === "FILLED" && (
              <div className="absolute right-0 top-0 bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-red-500/20">
                FILLED
              </div>
            )}
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-xl font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                  {job.company.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                    <span className="font-medium text-slate-300">
                      {job.company}
                    </span>
                    <span>•</span>
                    <span>
                      {job.employerAddress.slice(0, 6)}...
                      {job.employerAddress.slice(-4)}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {job.salary ? (
                  <div className="text-lg font-bold text-green-400">
                    {job.salary} SUI
                  </div>
                ) : (
                  <div className="text-sm font-medium text-slate-500">
                    Negotiable
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1">Project Based</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateJobForm({
  onJobPost,
  isConnected,
}: {
  onJobPost: (j: Job) => void;
  isConnected: boolean;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
    tags: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return alert("Please connect your wallet first.");

    const newJob: Job = {
      id: `0x${Math.random().toString(16).slice(2)}`,
      title: formData.title,
      company: "Anonymous Co.", // For Demo
      description: formData.description,
      salary: formData.salary ? Number(formData.salary) : null,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: "OPEN",
      employerAddress: "0x71C...9A2",
      applications: [],
      postedAt: Date.now(),
    };

    onJobPost(newJob);
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/50 border border-slate-800 rounded-2xl p-8 animate-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <PlusCircle className="text-cyan-500" />
        Post a New Job
      </h2>

      {!isConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg mb-6 text-sm">
          You must connect your wallet to post a job.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Job Title
          </label>
          <input
            required
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            placeholder="Ex: Senior Move Developer"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Description (Markdown)
          </label>
          <textarea
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-cyan-500 h-32 outline-none transition-all"
            placeholder="Enter job details here..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Salary (SUI) - Optional
            </label>
            <input
              type="number"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
              placeholder="Ex: 5000"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
              placeholder="DeFi, Rust, Frontend"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!isConnected}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish Job (On-Chain)
          </button>
          <p className="text-center text-xs text-slate-500 mt-3">
            This action will create a transaction on the Sui network and update
            the Shared Object.
          </p>
        </div>
      </form>
    </div>
  );
}

function JobDetail({
  job,
  onBack,
  isWalrusUploading,
  setUploading,
}: {
  job: Job;
  onBack: () => void;
  isWalrusUploading: boolean;
  setUploading: (s: boolean) => void;
}) {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setUploading(true);
    // Simulate Walrus upload + Contract Interaction
    setTimeout(() => {
      setUploading(false);
      setApplied(true);
    }, 3000);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <button
        onClick={onBack}
        className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-medium"
      >
        ← Back to List
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe2 className="w-4 h-4" /> Remote
                  </span>
                </div>
              </div>
              {job.status === "OPEN" ? (
                <span className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-sm font-bold border border-green-500/20">
                  OPEN
                </span>
              ) : (
                <span className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-sm font-bold border border-red-500/20">
                  FILLED
                </span>
              )}
            </div>

            <div className="prose prose-invert max-w-none mb-8 text-slate-300">
              <h3 className="text-white font-bold text-lg mb-2">
                Job Description
              </h3>
              <p>{job.description}</p>

              <h3 className="text-white font-bold text-lg mt-6 mb-2">
                Requirements
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>
                  Experience with Sui Move and object-oriented programming
                </li>
                <li>Modern UI development with React and TypeScript</li>
                <li>Web3 wallet integrations (Sui Wallet Adapter)</li>
              </ul>
            </div>

            <div className="flex gap-3 border-t border-slate-800 pt-6">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-800 rounded-md text-xs text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-500">Salary</span>
                <span className="text-green-400 font-bold font-mono">
                  {job.salary ? `${job.salary} SUI` : "Negotiable"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-500">Posted</span>
                <span className="text-slate-300">2 days ago</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-500">Employer</span>
                <span className="text-slate-300 font-mono">
                  {job.employerAddress.slice(0, 6)}...
                </span>
              </div>
            </div>

            {/* Application Logic */}
            <div className="mt-8">
              {applied ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <h4 className="text-green-500 font-bold">
                    Application Sent!
                  </h4>
                  <p className="text-xs text-green-400/70 mt-1">
                    Walrus Blob ID has been recorded on-chain.
                  </p>
                </div>
              ) : isWalrusUploading ? (
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6 text-center space-y-3">
                  <UploadCloud className="w-8 h-8 text-cyan-500 mx-auto animate-bounce" />
                  <div>
                    <h4 className="text-cyan-400 font-bold animate-pulse">
                      Uploading to Walrus...
                    </h4>
                    <p className="text-xs text-cyan-400/60 mt-1">
                      Encrypting file (Seal) and creating blob.
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-cyan-500 h-full w-2/3 animate-[shimmer_1s_infinite]"></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={job.status === "FILLED"}
                  className="w-full bg-white text-black hover:bg-slate-200 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Now <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Employer Only Area (Demo) */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <User className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">
                Employer Panel (Demo)
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Applications</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-white">
                  {job.applications.length}
                </span>
              </div>
              {job.applications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500 mb-2">
                    Last Application:
                  </p>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-cyan-400">
                      blob_...xyz
                    </span>
                    <button className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-white">
                      Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
