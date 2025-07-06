"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { ChallengeCardReal } from "~~/components/flagchain/ChallengeCardReal";
import { SubmitFlag } from "~~/components/flagchain/SubmitFlag";
import { useChallenge } from "~~/hooks/flagchain/useChallenge";
import { useFlag } from "~~/hooks/flagchain/useFlag";
import { useChallenges } from "~~/hooks/flagchain/useChallenges";
import { useGlobalStats } from "~~/hooks/flagchain/useGlobalStats";
import { FlagLevel } from "~~/types/flagchain";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { totalChallenges } = useChallenge();
  const { getUserSolveStats, handleSubmitFlag, getRecentFlags } = useFlag();
  const { totalFlags, activeUsers, loading: statsLoading } = useGlobalStats();
  
  // Challenges functionality
  const { challenges, loading: challengesLoading, filterChallenges, getStats, getLeaderboard } = useChallenges();
  
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [showSubmitFlag, setShowSubmitFlag] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<number | "all">("all");
  
  const userStats = getUserSolveStats();
  const recentFlags = getRecentFlags(5);
  const challengeStats = getStats();
  const leaderboard = getLeaderboard();

  // Filtrar challenges por dificultad
  const filteredChallenges =
    difficultyFilter === "all" ? challenges : filterChallenges({ difficulty: difficultyFilter });

  // Efecto para scroll automático cuando se accede con hash #challenges-section
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#challenges-section") {
      setTimeout(() => {
        document.getElementById('challenges-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, []);

  const handleFlagSubmit = async (challengeId: bigint, flag: string, level: FlagLevel) => {
    try {
      await handleSubmitFlag(challengeId, flag, level);
      setShowSubmitFlag(false);
      setSelectedChallenge(null);
    } catch (error) {
      console.error("Error submitting flag:", error);
    }
  };

  const handleViewChallenge = (challengeId: bigint) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge?.challengeURL) {
        window.open(challenge.challengeURL, '_blank');
      }
    } catch (error) {
      console.error("Error opening challenge:", error);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col grow">
        {/* Hero Section */}
        <div className="hero min-h-[50vh] sm:min-h-[60vh] bg-gradient-to-r from-primary to-secondary rounded-lg mx-2 sm:mx-4 text-primary-content">
          <div className="hero-content text-center px-4">
            <div className="max-w-md">
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-5">
                <div className="relative w-12 h-[51px] sm:w-16 sm:h-[68px]">
                  <img src="/logo.png" alt="FlagChain logo" className="w-full h-full object-contain dark:brightness-0 dark:invert" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">FlagChain</h1>
              </div>
              <p className="mb-5 text-lg sm:text-xl px-2">
                The first decentralized platform for CTFs (Capture The Flag) 
                built on blockchain.
              </p>
              
              {connectedAddress ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:space-x-2">
                    <span className="font-medium text-sm sm:text-base">Connected as:</span>
                    <Address address={connectedAddress} />
                  </div>
                  
                  {/* User stats */}
                  <div className="stats stats-vertical sm:stats-horizontal bg-base-100 text-base-content shadow-lg">
                    <div className="stat">
                      <div className="stat-title">Points</div>
                      <div className="stat-value text-primary text-2xl sm:text-3xl">{userStats.totalPoints}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Flags</div>
                      <div className="stat-value text-secondary text-2xl sm:text-3xl">{userStats.totalSolves}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">🩸 First Bloods</div>
                      <div className="stat-value text-accent text-2xl sm:text-3xl">{userStats.firstBloods}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button 
                      className="btn btn-accent btn-md sm:btn-lg" 
                      onClick={() => document.getElementById('challenges-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      🚩 Explore Challenges
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg text-primary-content/90">
                    Connect your wallet to start competing
                  </p>
                  <p className="text-sm text-primary-content/80">
                    Solve challenges, earn points and climb the leaderboard
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Challenges Section */}
        <div id="challenges-section" className="w-full px-4 sm:px-8 py-12 bg-base-200">
          <div className="max-w-7xl mx-auto">
            {/* Global Stats */}
            <div className="mb-12 bg-base-100 rounded-3xl shadow-xl">
              <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
                <div className="stat place-items-center">
                  <div className="stat-title text-base-content">Total Challenges</div>
                  <div className="stat-value text-primary text-2xl sm:text-3xl">
                    {statsLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      totalChallenges
                    )}
                  </div>
                  <div className="stat-desc text-base-content/80">Created by the community</div>
                </div>
                
                <div className="stat place-items-center">
                  <div className="stat-title text-base-content">Solved Flags</div>
                  <div className="stat-value text-secondary text-2xl sm:text-3xl">
                    {statsLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      totalFlags
                    )}
                  </div>
                  <div className="stat-desc text-base-content/80">Across the platform</div>
                </div>
                
                <div className="stat place-items-center">
                  <div className="stat-title text-base-content">Active Hackers</div>
                  <div className="stat-value text-accent text-2xl sm:text-3xl">
                    {statsLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      activeUsers
                    )}
                  </div>
                  <div className="stat-desc text-base-content/80">On the platform</div>
                </div>
              </div>
            </div>

            {challengesLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <span className="ml-4 text-lg mt-4 text-base-content">Loading challenges...</span>
                <p className="text-sm text-base-content/80 mt-2">Getting data from contract and IPFS...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Main column - Challenges */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-base-content">Available Challenges</h2>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          className="select select-bordered select-sm w-full sm:w-auto"
                          value={difficultyFilter}
                          onChange={e => setDifficultyFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                        >
                          <option value="all">All difficulties</option>
                          <option value={1}>Easy</option>
                          <option value={2}>Medium</option>
                          <option value={3}>Hard</option>
                        </select>
                        <Link href="/create" className="btn btn-primary btn-sm w-full sm:w-auto">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Challenge
                        </Link>
                      </div>
                    </div>

                    {/* Challenges list */}
                    <div className="space-y-4">
                      {filteredChallenges.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-5xl sm:text-6xl mb-4">🎯</div>
                          <h3 className="text-lg sm:text-xl font-bold mb-2 text-base-content">
                            {challenges.length === 0 ? "No challenges available" : "No challenges with this filter"}
                          </h3>
                          <p className="text-base-content/85 mb-4 px-4">
                            {challenges.length === 0
                              ? "Be the first to add a challenge on FlagChain. Share your knowledge with the community!"
                              : difficultyFilter === "all"
                                ? "Try a different filter to see more challenges."
                                : "No challenges with this difficulty. Try another filter."}
                          </p>
                          {challenges.length === 0 ? (
                            <Link href="/create" className="btn btn-primary">
                              🛠️ Add the first challenge
                            </Link>
                          ) : (
                            <button className="btn btn-outline" onClick={() => setDifficultyFilter("all")}>
                              View all challenges
                            </button>
                          )}
                        </div>
                      ) : (
                        filteredChallenges.map(challenge => (
                          <ChallengeCardReal
                            key={challenge.id.toString()}
                            challenge={challenge}
                            onSubmitFlag={handleFlagSubmit}
                            onDownload={handleViewChallenge}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Leaderboard */}
                    <div className="card bg-base-100 shadow-xl">
                      <div className="card-body p-4 sm:p-6">
                        <h3 className="card-title text-base sm:text-lg mb-4">🏆 Leaderboard</h3>
                        <div className="space-y-3">
                          {leaderboard.length > 0 ? (
                            leaderboard.slice(0, 5).map((user, index) => (
                              <div key={user.address} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs sm:text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-xs sm:text-sm truncate w-20 sm:w-24">
                                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary text-sm sm:text-base">{user.score}</div>
                                  <div className="text-xs text-base-content/75">points</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-base-content/85 text-sm">No ranking data yet</p>
                              <p className="text-xs text-base-content/75 mt-1">Be the first to solve a challenge!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent flags */}
                    <div className="card bg-base-100 shadow-xl">
                      <div className="card-body p-4 sm:p-6">
                        <h3 className="card-title text-base sm:text-lg mb-4">🚩 Recent Flags</h3>
                        <div className="space-y-3">
                          {recentFlags.length > 0 ? (
                            recentFlags.map((flag, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-xs sm:text-sm">Challenge #{flag.challengeId.toString()}</div>
                                  <div className="text-xs text-base-content/75">
                                    {flag.solver.slice(0, 6)}...{flag.solver.slice(-4)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-accent text-sm sm:text-base">{flag.points.toString()}</div>
                                  <div className="text-xs text-base-content/75">{flag.level === FlagLevel.User ? "User" : "Root"}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-base-content/85 text-sm">No recent flags</p>
                              <p className="text-xs text-base-content/75 mt-1">Latest solves will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="card bg-base-100 shadow-xl">
                      <div className="card-body p-4 sm:p-6">
                        <h3 className="card-title text-base sm:text-lg mb-4">📂 Categories</h3>
                        <div className="space-y-2">
                          {challengeStats.categories.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {challengeStats.categories.map(category => (
                                <div key={category} className="badge badge-outline text-xs">
                                  {category}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-base-content/85 text-sm">No categories yet</p>
                              <p className="text-xs text-base-content/75 mt-1">Categories will appear when challenges are created</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grow bg-base-300 w-full px-4 sm:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-base-content mb-4">Why FlagChain?</h2>
              <p className="text-lg text-base-content/80 max-w-2xl mx-auto">
                The first decentralized CTF platform that revolutionizes competitive cybersecurity with blockchain
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Decentralized */}
              <div className="flex flex-col bg-base-100 px-6 sm:px-8 py-8 sm:py-10 text-center items-center rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-primary text-primary-content w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-base-content">100% Decentralized</h3>
                <p className="text-sm text-base-content/70">
                  All challenges and scores are stored on blockchain.
                  No central servers, no censorship, no downtime.
                </p>
              </div>

              {/* Cryptographic Security */}
              <div className="flex flex-col bg-base-100 px-6 sm:px-8 py-8 sm:py-10 text-center items-center rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-secondary text-secondary-content w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-base-content">Cryptographic Security</h3>
                <p className="text-sm text-base-content/70">
                  Flags are verified using ECDSA cryptography.
                  Impossible to manipulate, forge or cheat.
                </p>
              </div>

              {/* Global Competition */}
              <div className="flex flex-col bg-base-100 px-6 sm:px-8 py-8 sm:py-10 text-center items-center rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-accent text-accent-content w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-base-content">Global Competition</h3>
                <p className="text-sm text-base-content/70">
                  Compete with hackers from around the world.
                  Immutable and transparent ranking for everyone.
                </p>
              </div>

              {/* IPFS Storage */}
              <div className="flex flex-col bg-base-100 px-6 sm:px-8 py-8 sm:py-10 text-center items-center rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-info text-info-content w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-base-content">IPFS Storage</h3>
                <p className="text-sm text-base-content/70">
                  Files and metadata distributed on IPFS.
                  Available forever, no external dependencies.
                </p>
              </div>

              {/* First Blood System */}
              <div className="flex flex-col bg-base-100 px-6 sm:px-8 py-8 sm:py-10 text-center items-center rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-error text-error-content w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-base-content">First Blood System</h3>
                <p className="text-sm text-base-content/70">
                  Be the first to solve a challenge and get bonuses.
                  Special recognition for the fastest hackers.
                </p>
              </div>

              {/* Community Driven */}
              <div className="flex flex-col bg-base-100 px-6 sm:px-8 py-8 sm:py-10 text-center items-center rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-success text-success-content w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-base-content">Community Driven</h3>
                <p className="text-sm text-base-content/70">
                  Anyone can create challenges and contribute.
                  Built by hackers, for hackers.
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mt-12 sm:mt-16">
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-8 text-base-content">Unique FlagChain Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-base-100 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-base-content mb-2">Direct Monetization</h4>
                      <p className="text-sm text-base-content/70">
                        Creators can monetize their challenges directly. Solvers compete for token rewards.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary/10 p-3 rounded-full">
                      <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-base-content mb-2">Automatic Verification</h4>
                      <p className="text-sm text-base-content/70">
                        Automated system that verifies flags using cryptography, eliminating the need for moderators.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-3 rounded-full">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-base-content mb-2">Immutable Progress</h4>
                      <p className="text-sm text-base-content/70">
                        Your progress and achievements are permanently recorded on blockchain. Verifiable skills portfolio.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="bg-info/10 p-3 rounded-full">
                      <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-base-content mb-2">Global 24/7 Access</h4>
                      <p className="text-sm text-base-content/70">
                        Platform available 24 hours from anywhere in the world. No geographical restrictions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Call to Action */}
        <div className="w-full px-4 sm:px-8 py-12 bg-base-300">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-base-content">Ready for the challenge?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create" className="btn btn-primary btn-lg">
                  🛠️ Add Challenge
                </Link>
                <Link href="/debug" className="btn btn-secondary btn-lg">
                  🔧 Debug Contracts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal to submit flag */}
      {showSubmitFlag && selectedChallenge && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm sm:max-w-lg">
            <h3 className="font-bold text-lg mb-4">Solve Challenge: {selectedChallenge.name}</h3>
            <SubmitFlag
              challenge={selectedChallenge}
              onFlagSubmitted={success => {
                if (success) {
                  setShowSubmitFlag(false);
                  setSelectedChallenge(null);
                }
              }}
            />
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowSubmitFlag(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
