/**
 * Recommendation Engine for DevTinder
 * Uses a weighted scoring algorithm to recommend developers based on:
 * - Skill overlap (60% weight)
 * - Interest overlap (30% weight)
 * - Random diversity factor (10% weight)
 */

const User = require("../models/user");

/**
 * Calculate skill similarity between two users
 * Uses Jaccard similarity: intersection / union
 */
const calculateSkillSimilarity = (userSkills, candidateSkills) => {
  if (!userSkills.length || !candidateSkills.length) return 0;

  const userSet = new Set(userSkills.map(s => s.toLowerCase()));
  const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));

  // Find intersection
  const intersection = [...userSet].filter(skill => candidateSet.has(skill)).length;

  // Find union
  const union = new Set([...userSet, ...candidateSet]).size;

  // Jaccard similarity coefficient
  return union > 0 ? intersection / union : 0;
};

/**
 * Calculate interest similarity between two users
 */
const calculateInterestSimilarity = (userInterests, candidateInterests) => {
  if (!userInterests.length || !candidateInterests.length) return 0;

  const userSet = new Set(userInterests);
  const candidateSet = new Set(candidateInterests);

  // Find intersection
  const intersection = [...userSet].filter(interest => candidateSet.has(interest)).length;

  // Find union
  const union = new Set([...userSet, ...candidateSet]).size;

  // Jaccard similarity coefficient
  return union > 0 ? intersection / union : 0;
};

/**
 * Calculate interaction recency bonus
 * Users that were liked/skipped recently should have less weight in future recommendations
 */
const getInteractionBonus = (likedUsers, skippedUsers, candidateId) => {
  // If user was liked, return 0 (exclude from recommendations)
  const likedUser = likedUsers.find(u => u.userId.toString() === candidateId.toString());
  if (likedUser) return -1; // Already liked, exclude

  // If user was skipped, apply penalty based on recency
  const skippedUser = skippedUsers.find(u => u.userId.toString() === candidateId.toString());
  if (skippedUser) {
    // Skip older than 7 days gets a small chance to re-appear
    const daysSinceSkip = (Date.now() - new Date(skippedUser.skippedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceSkip < 7) return -0.5; // Heavy penalty if skipped recently
    if (daysSinceSkip < 30) return -0.2; // Light penalty if skipped a month ago
  }

  return 0; // No bonus/penalty
};

/**
 * Main recommendation function with optimized MongoDB aggregation
 * @param {String} userId - Current user's ID
 * @param {Object} options - Configuration options
 * @returns {Array} Top 10 recommended users
 */
const getRecommendedUsers = async (userId, options = {}) => {
  try {
    const {
      limit = 10,
      minSkillMatch = 0.1, // Minimum skill overlap threshold
      includeNonMatching = true // Include users with zero skill match for diversity
    } = options;

    // Fetch current user
    const currentUser = await User.findById(userId).lean();
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get list of user IDs to exclude (self, liked, skipped, matched)
    const excludedUserIds = [
      userId,
      ...currentUser.likedUsers.map(u => u.userId),
      ...currentUser.skippedUsers.map(u => u.userId),
      ...currentUser.matchedUsers.map(u => u.userId)
    ];

    // Fetch all candidate users (optimized with lean())
    const candidates = await User.find({
      _id: { $nin: excludedUserIds }
    })
      .select("firstName lastName photoUrl about skills interests age")
      .lean();

    // Score all candidates
    const scoredCandidates = candidates
      .map(candidate => {
        // Calculate skill similarity (0 to 1)
        const skillSimilarity = calculateSkillSimilarity(
          currentUser.skills || [],
          candidate.skills || []
        );

        // Calculate interest similarity (0 to 1)
        const interestSimilarity = calculateInterestSimilarity(
          currentUser.interests || [],
          candidate.interests || []
        );

        // Get interaction bonus/penalty
        const interactionBonus = getInteractionBonus(
          currentUser.likedUsers,
          currentUser.skippedUsers,
          candidate._id
        );

        // If already marked as liked/skipped with penalty, exclude
        if (interactionBonus === -1) return null;

        // Random diversity factor (0 to 1)
        const randomFactor = Math.random();

        // Weighted scoring formula
        const baseScore =
          (skillSimilarity * 0.6) +
          (interestSimilarity * 0.3) +
          (randomFactor * 0.1);

        // Apply interaction bonus/penalty
        const finalScore = Math.max(0, baseScore + interactionBonus);

        // Filter by minimum skill match threshold
        if (skillSimilarity < minSkillMatch && !includeNonMatching) {
          return null;
        }

        return {
          _id: candidate._id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          photoUrl: candidate.photoUrl,
          about: candidate.about,
          skills: candidate.skills || [],
          interests: candidate.interests || [],
          age: candidate.age,
          score: finalScore,
          matchMetrics: {
            skillSimilarity: parseFloat((skillSimilarity * 100).toFixed(2)),
            interestSimilarity: parseFloat((interestSimilarity * 100).toFixed(2))
          }
        };
      })
      .filter(candidate => candidate !== null) // Remove null entries
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit); // Get top N recommendations

    return scoredCandidates;
  } catch (error) {
    throw new Error(`Recommendation engine error: ${error.message}`);
  }
};

/**
 * Advanced recommendation using MongoDB aggregation pipeline
 * More efficient for large datasets
 * @param {String} userId - Current user's ID
 * @param {Number} limit - Number of recommendations to return
 * @returns {Array} Top N recommended users with detailed metrics
 */
const getRecommendedUsersAggregated = async (userId, limit = 10) => {
  try {
    const currentUser = await User.findById(userId).lean();
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Build array of excluded IDs
    const excludedUserIds = [
      userId,
      ...currentUser.likedUsers.map(u => u.userId),
      ...currentUser.skippedUsers.map(u => u.userId),
      ...currentUser.matchedUsers.map(u => u.userId)
    ];

    const recommendations = await User.aggregate([
      // Stage 1: Filter out current user and interacted users
      {
        $match: {
          _id: { $nin: excludedUserIds }
        }
      },
      // Stage 2: Project only needed fields
      {
        $project: {
          firstName: 1,
          lastName: 1,
          photoUrl: 1,
          about: 1,
          skills: 1,
          interests: 1,
          age: 1,
          // Convert skills and interests to lowercase for case-insensitive matching
          skillsLower: {
            $map: {
              input: "$skills",
              as: "skill",
              in: { $toLower: "$$skill" }
            }
          },
          interestsLower: "$interests"
        }
      },
      // Stage 3: Calculate metrics (limited aggregation for performance)
      {
        $addFields: {
          // Count skill intersections
          skillIntersection: {
            $size: {
              $setIntersection: [
                {
                  $map: {
                    input: currentUser.skills || [],
                    as: "skill",
                    in: { $toLower: "$$skill" }
                  }
                },
                "$skillsLower"
              ]
            }
          },
          skillUnion: {
            $size: {
              $setUnion: [
                {
                  $map: {
                    input: currentUser.skills || [],
                    as: "skill",
                    in: { $toLower: "$$skill" }
                  }
                },
                "$skillsLower"
              ]
            }
          },
          // Count interest intersections
          interestIntersection: {
            $size: {
              $setIntersection: [
                currentUser.interests || [],
                "$interestsLower"
              ]
            }
          },
          interestUnion: {
            $size: {
              $setUnion: [
                currentUser.interests || [],
                "$interestsLower"
              ]
            }
          }
        }
      },
      // Stage 4: Calculate Jaccard similarity scores
      {
        $addFields: {
          skillSimilarity: {
            $cond: [
              { $eq: ["$skillUnion", 0] },
              0,
              { $divide: ["$skillIntersection", "$skillUnion"] }
            ]
          },
          interestSimilarity: {
            $cond: [
              { $eq: ["$interestUnion", 0] },
              0,
              { $divide: ["$interestIntersection", "$interestUnion"] }
            ]
          },
          randomFactor: { $rand: {} } // Generate random number for diversity
        }
      },
      // Stage 5: Calculate final score
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$skillSimilarity", 0.6] },
              { $multiply: ["$interestSimilarity", 0.3] },
              { $multiply: ["$randomFactor", 0.1] }
            ]
          }
        }
      },
      // Stage 6: Sort by score and limit results
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      },
      // Stage 7: Final projection
      {
        $project: {
          firstName: 1,
          lastName: 1,
          photoUrl: 1,
          about: 1,
          skills: 1,
          interests: 1,
          age: 1,
          score: { $round: ["$score", 4] },
          matchMetrics: {
            skillSimilarity: { $round: [{ $multiply: ["$skillSimilarity", 100] }, 2] },
            interestSimilarity: { $round: [{ $multiply: ["$interestSimilarity", 100] }, 2] }
          }
        }
      }
    ]);

    return recommendations;
  } catch (error) {
    throw new Error(`Aggregation pipeline error: ${error.message}`);
  }
};

/**
 * Get detailed compatibility report between two users
 * @param {String} userId1 - First user ID
 * @param {String} userId2 - Second user ID
 * @returns {Object} Detailed compatibility metrics
 */
const getCompatibilityReport = async (userId1, userId2) => {
  try {
    const [user1, user2] = await Promise.all([
      User.findById(userId1).lean(),
      User.findById(userId2).lean()
    ]);

    if (!user1 || !user2) {
      throw new Error("One or both users not found");
    }

    const skillSimilarity = calculateSkillSimilarity(user1.skills || [], user2.skills || []);
    const interestSimilarity = calculateInterestSimilarity(user1.interests || [], user2.interests || []);

    return {
      user1: {
        firstName: user1.firstName,
        lastName: user1.lastName,
        skills: user1.skills || [],
        interests: user1.interests || []
      },
      user2: {
        firstName: user2.firstName,
        lastName: user2.lastName,
        skills: user2.skills || [],
        interests: user2.interests || []
      },
      compatibility: {
        skillSimilarity: parseFloat((skillSimilarity * 100).toFixed(2)),
        interestSimilarity: parseFloat((interestSimilarity * 100).toFixed(2)),
        commonSkills: [...new Set(user1.skills || [])].filter(s =>
          (user2.skills || []).some(s2 => s2.toLowerCase() === s.toLowerCase())
        ),
        commonInterests: [...new Set(user1.interests || [])].filter(i =>
          (user2.interests || []).includes(i)
        ),
        overallCompatibility: parseFloat(
          ((skillSimilarity * 0.6 + interestSimilarity * 0.3) * 100).toFixed(2)
        )
      }
    };
  } catch (error) {
    throw new Error(`Compatibility report error: ${error.message}`);
  }
};

module.exports = {
  getRecommendedUsers,
  getRecommendedUsersAggregated,
  getCompatibilityReport,
  calculateSkillSimilarity,
  calculateInterestSimilarity
};
