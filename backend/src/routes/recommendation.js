/**
 * Recommendation Routes for DevTinder
 * Handles:
 * - Getting recommendations
 * - Liking users
 * - Skipping users
 * - Viewing compatibility reports
 */

const express = require("express");
const router = express.Router();
const { userAuth: auth } = require("../middlewares/auth");
const User = require("../models/user");
const {
  getRecommendedUsers,
  getRecommendedUsersAggregated,
  getCompatibilityReport
} = require("../utils/recommendationEngine");

/**
 * Map interest categories to related skills
 */
const CATEGORY_SKILLS_MAP = {
  "web dev": ["react", "vue", "angular", "javascript", "html", "css", "next.js", "nuxt", "svelte", "astro", "web"],
  "backend": ["node.js", "express", "django", "flask", "fastapi", "java", "c#", "python", "graphql", "rest api", "backend"],
  "frontend": ["react", "vue", "angular", "javascript", "html", "css", "tailwind", "bootstrap", "material ui", "typescript", "front"],
  "full stack": ["react", "node.js", "javascript", "python", "django", "express", "mongodb", "postgresql", "aws", "docker", "stack"],
  "mobile dev": ["react native", "flutter", "swiftui", "kotlin", "javascript", "typescript", "mobile"],
  "data science": ["python", "machine learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "sql", "data"],
  "ai": ["machine learning", "tensorflow", "pytorch", "openai", "python", "data science", "scikit-learn"],
  "blockchain": ["solidity", "web3.js", "ethers.js", "smart contracts", "javascript", "typescript", "blockchain", "web3"],
  "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "devops", "cloud"],
  "devops": ["docker", "kubernetes", "ci/cd", "jenkins", "github actions", "git", "aws", "azure", "devops"],
  "open source": ["git", "github", "javascript", "python", "java", "typescript", "open"],
  "startups": [],
};

/**
 * Get skills to filter by - expand categories to actual skills
 */
const getFilterSkills = (inputSkills) => {
  const allSkills = new Set();
  
  inputSkills.forEach(skill => {
    const lowerSkill = skill.toLowerCase().trim();
    
    // If it's a known category, add all related skills
    if (CATEGORY_SKILLS_MAP[lowerSkill]) {
      CATEGORY_SKILLS_MAP[lowerSkill].forEach(s => allSkills.add(s));
    } else {
      // Otherwise, treat it as a specific skill
      allSkills.add(lowerSkill);
    }
  });
  
  return Array.from(allSkills);
};

/**
 * GET /api/recommendations
 * Get recommended users for the logged-in user
 * Query params:
 *   - limit: number of recommendations (default: 10, max: 50)
 *   - method: 'simple' or 'aggregated' (default: 'simple')
 */
router.get("/recommendations", auth, async (req, res) => {
  try {
    const { limit = 10, method = "simple" } = req.query;
    const limitNum = Math.min(parseInt(limit) || 10, 50); // Cap at 50

    let recommendations;

    if (method === "aggregated") {
      // Use MongoDB aggregation pipeline (more efficient for large datasets)
      recommendations = await getRecommendedUsersAggregated(req.user._id, limitNum);
    } else {
      // Use application-level scoring (more flexible)
      recommendations = await getRecommendedUsers(req.user._id, {
        limit: limitNum,
        minSkillMatch: 0,
        includeNonMatching: true
      });
    }

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/recommendations/filtered-by-skills
 * Get recommended users filtered by required skills
 * Query params:
 *   - skills: comma-separated list of required skills (required)
 *   - limit: number of recommendations (default: 10, max: 50)
 */
router.get("/recommendations/filtered-by-skills", auth, async (req, res) => {
  try {
    const { skills, limit = 10 } = req.query;

    if (!skills) {
      return res.status(400).json({
        success: false,
        message: "Skills parameter is required. Use comma-separated values (e.g., ?skills=React,Node.js)"
      });
    }

    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const inputSkills = skills.split(",").map(s => s.trim()).filter(Boolean);
    
    if (inputSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one skill must be provided"
      });
    }

    // Expand categories to actual skills
    const expandedSkills = getFilterSkills(inputSkills);

    // Get recommendations first
    const recommendations = await getRecommendedUsers(req.user._id, {
      limit: limitNum * 5, // Get more candidates to filter
      minSkillMatch: 0,
      includeNonMatching: true
    });

    // Filter by required skills - user must have AT LEAST ONE matching skill from expanded list
    const filteredRecommendations = recommendations.filter(user => {
      const userSkillsLower = user.skills.map(s => s.toLowerCase());
      
      // Check if user has any of the expanded skills
      return expandedSkills.some(requiredSkill =>
        userSkillsLower.some(userSkill =>
          userSkill.includes(requiredSkill) || requiredSkill.includes(userSkill)
        )
      );
    }).slice(0, limitNum);

    res.json({
      success: true,
      count: filteredRecommendations.length,
      appliedFilters: {
        originalSkills: inputSkills,
        expandedSkills: expandedSkills.slice(0, 10), // Show first 10 expanded skills
        skillCount: inputSkills.length
      },
      data: filteredRecommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/recommendations/:userId/like
 * Mark a user as liked
 */
router.post("/recommendations/:userId/like", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Validate user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent self-like
    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot like yourself"
      });
    }

    // Add to likedUsers if not already there
    const currentUser = await User.findById(currentUserId);
    const isAlreadyLiked = currentUser.likedUsers.some(
      u => u.userId.toString() === userId
    );

    if (isAlreadyLiked) {
      return res.status(400).json({
        success: false,
        message: "User already liked"
      });
    }

    // Add like
    currentUser.likedUsers.push({ userId, likedAt: new Date() });

    // Remove from skipped if exists
    currentUser.skippedUsers = currentUser.skippedUsers.filter(
      u => u.userId.toString() !== userId
    );

    // Check for mutual match
    const targetHasLiked = targetUser.likedUsers.some(
      u => u.userId.toString() === currentUserId.toString()
    );

    if (targetHasLiked) {
      // Mutual match! Add to matched users for both
      if (!currentUser.matchedUsers.some(u => u.userId.toString() === userId)) {
        currentUser.matchedUsers.push({ userId, matchedAt: new Date() });
      }

      if (!targetUser.matchedUsers.some(u => u.userId.toString() === currentUserId.toString())) {
        targetUser.matchedUsers.push({
          userId: currentUserId,
          matchedAt: new Date()
        });
      }

      await targetUser.save();
    }

    await currentUser.save();

    res.json({
      success: true,
      message: targetHasLiked ? "Match! 🎉" : "User liked",
      isMatch: targetHasLiked,
      likedUser: {
        _id: targetUser._id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        photoUrl: targetUser.photoUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/recommendations/:userId/skip
 * Mark a user as skipped
 */
router.post("/recommendations/:userId/skip", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Validate user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already skipped
    const isAlreadySkipped = currentUser.skippedUsers.some(
      u => u.userId.toString() === userId
    );

    if (isAlreadySkipped) {
      return res.status(400).json({
        success: false,
        message: "User already skipped"
      });
    }

    // Add to skipped
    currentUser.skippedUsers.push({ userId, skippedAt: new Date() });

    // Remove from liked if exists
    currentUser.likedUsers = currentUser.likedUsers.filter(
      u => u.userId.toString() !== userId
    );

    await currentUser.save();

    res.json({
      success: true,
      message: "User skipped"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/recommendations/:userId/compatibility
 * Get detailed compatibility report with another user
 */
router.get("/recommendations/:userId/compatibility", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot get compatibility with yourself"
      });
    }

    const report = await getCompatibilityReport(currentUserId, userId);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/recommendations/matches
 * Get all matched users
 */
router.get("/matches", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).populate({
      path: "matchedUsers.userId",
      select: "firstName lastName photoUrl about skills interests age"
    });

    // Transform the response
    const matches = currentUser.matchedUsers.map(match => ({
      ...match.userId.toObject(),
      matchedAt: match.matchedAt
    }));

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/recommendations/interaction-history
 * Get user's interaction history (liked, skipped)
 */
router.get("/interaction-history", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).populate([
      {
        path: "likedUsers.userId",
        select: "firstName lastName photoUrl skills interests"
      },
      {
        path: "skippedUsers.userId",
        select: "firstName lastName photoUrl skills interests"
      }
    ]);

    const liked = currentUser.likedUsers.map(item => ({
      user: item.userId,
      interactedAt: item.likedAt,
      action: "liked"
    }));

    const skipped = currentUser.skippedUsers.map(item => ({
      user: item.userId,
      interactedAt: item.skippedAt,
      action: "skipped"
    }));

    // Combine and sort by date
    const history = [...liked, ...skipped].sort(
      (a, b) => new Date(b.interactedAt) - new Date(a.interactedAt)
    );

    res.json({
      success: true,
      stats: {
        liked: liked.length,
        skipped: skipped.length,
        total: history.length
      },
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/recommendations/profile
 * Update user profile with interests and project requirements
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { interests, projectRequirements } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(interests && { interests }),
        ...(projectRequirements && { projectRequirements })
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        interests: user.interests,
        projectRequirements: user.projectRequirements
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/recommendations/feed
 * Get paginated feed with recommendations
 * Query params:
 *   - page: page number (default: 1)
 *   - pageSize: items per page (default: 10, max: 50)
 */
router.get("/feed", auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 50);
    const skip = (page - 1) * pageSize;

    const currentUser = await User.findById(req.user._id).lean();
    
    const excludedUserIds = [
      req.user._id,
      ...currentUser.likedUsers.map(u => u.userId),
      ...currentUser.skippedUsers.map(u => u.userId),
      ...currentUser.matchedUsers.map(u => u.userId)
    ];

    // Get total count
    const total = await User.countDocuments({
      _id: { $nin: excludedUserIds }
    });

    // Get paginated recommendations
    const recommendations = await getRecommendedUsers(req.user._id, {
      limit: pageSize * page,
      minSkillMatch: 0,
      includeNonMatching: true
    });

    const paginatedResults = recommendations.slice(skip, skip + pageSize);

    res.json({
      success: true,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: skip + pageSize < total
      },
      data: paginatedResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
