import { ObjectId } from "mongodb";
import { Router } from "express";
import { getGroupsCollection, getUsersCollection } from "../db.js";
import { generateJoinCode, sanitizeGroup } from "../utils/groups.js";

const router = Router();
const ALLOWED_RECOMMENDATION_CATEGORIES = ["Anime", "Movie", "TV Show"];
const DEFAULT_GROUP_EMOJI = "🎬";

function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requireAuthenticatedUser(req) {
  if (!req.isAuthenticated?.() || !req.user) {
    throw createHttpError("You must be signed in.", 401);
  }

  return req.user;
}

function parseObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    throw createHttpError(`Invalid ${label}.`, 400);
  }

  return new ObjectId(id);
}

function normalizeTitle(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

async function findGroup(groupId) {
  return getGroupsCollection().findOne({
    _id: parseObjectId(groupId, "group id"),
  });
}

async function findUser(userId, label = "user id") {
  return getUsersCollection().findOne({ _id: parseObjectId(userId, label) });
}

function getMember(group, userId) {
  return (group.members ?? []).find((member) => member.userId === userId);
}

function requireGroup(group) {
  if (!group) {
    throw createHttpError("Group not found.", 404);
  }
}

function requireMember(
  group,
  userId,
  message = "Only group members can do this."
) {
  const member = getMember(group, userId);

  if (!member) {
    throw createHttpError(message, 403);
  }

  return member;
}

function requireOwner(group, userId, message) {
  if (group.ownerId !== userId) {
    throw createHttpError(message, 403);
  }
}

function findRecommendation(group, recommendationId) {
  const parsedRecommendationId = parseObjectId(
    recommendationId,
    "recommendation id"
  );

  const recommendation = (group.recommendations ?? []).find((item) =>
    item._id.equals(parsedRecommendationId)
  );

  return { parsedRecommendationId, recommendation };
}

async function createUniqueJoinCode() {
  const groupsCollection = getGroupsCollection();
  let joinCode = generateJoinCode();

  while (await groupsCollection.findOne({ joinCode })) {
    joinCode = generateJoinCode();
  }

  return joinCode;
}

router.get("/", async (req, res, next) => {
  try {
    const user = requireAuthenticatedUser(req);
    const userId = String(user._id);
    const query = userId
      ? {
          $or: [{ ownerId: userId }, { "members.userId": userId }],
        }
      : {};

    const groups = await getGroupsCollection()
      .find(query, {
        projection: {
          groupName: 1,
          description: 1,
          groupEmoji: 1,
          joinCode: 1,
          members: 1,
          recommendations: 1,
          ownerId: 1,
          ownerName: 1,
          createdAt: 1,
        },
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    res.json(groups.map(sanitizeGroup));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const user = requireAuthenticatedUser(req);
    const ownerId = String(user._id);
    const groupName = (req.body.groupName ?? "").trim();
    const description = (req.body.description ?? "").trim();
    const groupEmoji =
      (req.body.groupEmoji ?? "").trim() || DEFAULT_GROUP_EMOJI;

    if (!groupName) {
      throw createHttpError("Group name is required.", 400);
    }

    if (!description) {
      throw createHttpError("Description is required.", 400);
    }

    const owner = await findUser(ownerId, "owner id");

    if (!owner) {
      throw createHttpError("Owner not found.", 404);
    }

    const joinCode = await createUniqueJoinCode();
    const newGroup = {
      groupName,
      description,
      groupEmoji,
      joinCode,
      ownerId: String(owner._id),
      ownerName: owner.displayName,
      members: [
        {
          userId: String(owner._id),
          displayName: owner.displayName,
          username: owner.username,
          email: owner.email,
          role: "owner",
        },
      ],
      recommendations: [],
      createdAt: new Date(),
    };

    const result = await getGroupsCollection().insertOne(newGroup);
    const createdGroup = await getGroupsCollection().findOne({
      _id: result.insertedId,
    });

    res.status(201).json({
      group: sanitizeGroup(createdGroup),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/join", async (req, res, next) => {
  try {
    const currentUser = requireAuthenticatedUser(req);
    const userId = String(currentUser._id);
    const joinCode = (req.body.joinCode ?? "").trim().toUpperCase();

    if (!joinCode) {
      throw createHttpError("Group code is required.", 400);
    }

    const user = await findUser(userId);

    if (!user) {
      throw createHttpError("User not found.", 404);
    }

    const group = await getGroupsCollection().findOne({ joinCode });

    if (!group) {
      throw createHttpError("Group code not found.", 404);
    }

    const alreadyMember = (group.members ?? []).some(
      (member) => member.userId === String(user._id)
    );

    if (alreadyMember) {
      throw createHttpError("You are already in this group.", 409);
    }

    await getGroupsCollection().updateOne(
      { _id: group._id },
      {
        $push: {
          members: {
            userId: String(user._id),
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            role: "member",
          },
        },
      }
    );

    const updatedGroup = await getGroupsCollection().findOne({
      _id: group._id,
    });

    res.status(201).json({
      group: sanitizeGroup(updatedGroup),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const user = requireAuthenticatedUser(req);
    const userId = String(user._id);
    const groupName = (req.body.groupName ?? "").trim();
    const description = (req.body.description ?? "").trim();
    const groupEmoji =
      (req.body.groupEmoji ?? "").trim() || DEFAULT_GROUP_EMOJI;

    if (!groupName) {
      throw createHttpError("Group name is required.", 400);
    }

    if (!description) {
      throw createHttpError("Description is required.", 400);
    }

    const group = await findGroup(groupId);
    requireGroup(group);
    requireMember(
      group,
      userId,
      "Only group members can update group settings."
    );

    await getGroupsCollection().updateOne(
      { _id: group._id },
      {
        $set: {
          groupName,
          description,
          groupEmoji,
        },
      }
    );

    const updatedGroup = await getGroupsCollection().findOne({
      _id: group._id,
    });

    res.json({
      group: sanitizeGroup(updatedGroup),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:groupId/leave", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const user = requireAuthenticatedUser(req);
    const userId = String(user._id);

    const group = await findGroup(groupId);
    requireGroup(group);

    if (!getMember(group, userId)) {
      throw createHttpError("You are not a member of this group.", 404);
    }

    if (group.ownerId === userId) {
      await getGroupsCollection().deleteOne({ _id: group._id });
      res.json({
        action: "deleted",
        deletedGroupId: String(group._id),
      });
      return;
    }

    await getGroupsCollection().updateOne(
      { _id: group._id },
      {
        $pull: {
          members: { userId },
        },
      }
    );

    res.json({
      action: "left",
      deletedGroupId: null,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const user = requireAuthenticatedUser(req);
    const requesterUserId = String(user._id);

    const group = await findGroup(groupId);
    requireGroup(group);
    requireOwner(
      group,
      requesterUserId,
      "Only the group owner can delete this group."
    );

    await getGroupsCollection().deleteOne({ _id: group._id });

    res.json({
      deletedGroupId: String(group._id),
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:groupId/members/:memberUserId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const memberUserId = (req.params.memberUserId ?? "").trim();
    const user = requireAuthenticatedUser(req);
    const requesterUserId = String(user._id);

    if (!memberUserId) {
      throw createHttpError("Member user id is required.", 400);
    }

    const group = await findGroup(groupId);
    requireGroup(group);
    requireOwner(
      group,
      requesterUserId,
      "Only the group owner can remove members."
    );

    if (group.ownerId === memberUserId) {
      throw createHttpError("The owner cannot be removed from the group.", 400);
    }

    const memberExists = (group.members ?? []).some(
      (member) => member.userId === memberUserId
    );

    if (!memberExists) {
      throw createHttpError("Member not found in this group.", 404);
    }

    await getGroupsCollection().updateOne(
      { _id: group._id },
      {
        $pull: {
          members: { userId: memberUserId },
        },
      }
    );

    const updatedGroup = await getGroupsCollection().findOne({
      _id: group._id,
    });

    res.json({
      group: sanitizeGroup(updatedGroup),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:groupId/recommendations", async (req, res, next) => {
  try {
    const user = requireAuthenticatedUser(req);
    const groupId = req.params.groupId;
    const title = (req.body.title ?? "").trim();
    const category = (req.body.category ?? "").trim();
    const platform = (req.body.platform ?? "").trim();
    const note = (req.body.note ?? "").trim();
    const rating = Number(req.body.rating);
    const addedByUserId = String(user._id);
    const posterUrl = (req.body.posterUrl ?? "").trim();
    const imdbId = (req.body.imdbId ?? "").trim();
    const imdbRating = (req.body.imdbRating ?? "").trim();

    if (!title) {
      throw createHttpError("Title is required.", 400);
    }

    if (!ALLOWED_RECOMMENDATION_CATEGORIES.includes(category)) {
      throw createHttpError("Category must be Anime, Movie, or TV Show.", 400);
    }

    if (!platform) {
      throw createHttpError("Platform is required.", 400);
    }

    if (!note) {
      throw createHttpError("Note is required.", 400);
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 10) {
      throw createHttpError("Rating must be a number between 1 and 10.", 400);
    }

    const group = await findGroup(groupId);
    requireGroup(group);
    const addedByUser = await findUser(addedByUserId, "added-by user id");

    if (!addedByUser) {
      throw createHttpError("User not found.", 404);
    }

    requireMember(
      group,
      String(addedByUser._id),
      "Only group members can add recommendations."
    );

    const duplicateExists = (group.recommendations ?? []).some(
      (recommendation) =>
        (imdbId &&
          recommendation.imdbId &&
          recommendation.imdbId.toLowerCase() === imdbId.toLowerCase()) ||
        (normalizeTitle(recommendation.title) === normalizeTitle(title) &&
          recommendation.category === category)
    );

    if (duplicateExists) {
      throw createHttpError(
        "That title is already recommended in this group.",
        409
      );
    }

    const recommendation = {
      _id: new ObjectId(),
      title,
      category,
      platform,
      note,
      rating,
      addedBy: addedByUser.displayName,
      addedByUserId: String(addedByUser._id),
      posterUrl,
      imdbId,
      imdbRating,
      votes: [],
      votesUp: 0,
      votesDown: 0,
      comments: [],
      createdAt: new Date(),
    };

    await getGroupsCollection().updateOne(
      { _id: group._id },
      {
        $push: {
          recommendations: recommendation,
        },
      }
    );

    const updatedGroup = await getGroupsCollection().findOne({
      _id: group._id,
    });

    res.status(201).json({
      group: sanitizeGroup(updatedGroup),
    });
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:groupId/recommendations/:recommendationId",
  async (req, res, next) => {
    try {
      const user = requireAuthenticatedUser(req);
      const groupId = req.params.groupId;
      const recommendationId = req.params.recommendationId;
      const requesterUserId = String(user._id);

      const group = await findGroup(groupId);
      requireGroup(group);
      requireOwner(
        group,
        requesterUserId,
        "Only the group owner can remove recommendations."
      );
      const { parsedRecommendationId } = findRecommendation(
        group,
        recommendationId
      );

      await getGroupsCollection().updateOne(
        { _id: group._id },
        {
          $pull: {
            recommendations: { _id: parsedRecommendationId },
          },
        }
      );

      const updatedGroup = await getGroupsCollection().findOne({
        _id: group._id,
      });

      res.json({
        group: sanitizeGroup(updatedGroup),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:groupId/recommendations/:recommendationId/vote",
  async (req, res, next) => {
    try {
      const user = requireAuthenticatedUser(req);
      const groupId = req.params.groupId;
      const recommendationId = req.params.recommendationId;
      const userId = String(user._id);
      const direction = (req.body.direction ?? "").trim().toLowerCase();

      if (!["up", "down"].includes(direction)) {
        throw createHttpError("Vote direction must be up or down.", 400);
      }

      const group = await findGroup(groupId);
      requireGroup(group);
      requireMember(group, userId, "Only group members can vote.");
      const { parsedRecommendationId, recommendation } = findRecommendation(
        group,
        recommendationId
      );

      if (!recommendation) {
        throw createHttpError("Recommendation not found.", 404);
      }

      const nextRecommendations = (group.recommendations ?? []).map(
        (recommendation) => {
          if (!recommendation._id.equals(parsedRecommendationId)) {
            return recommendation;
          }

          const currentVotes = recommendation.votes ?? [];
          const existingVote = currentVotes.find(
            (vote) => vote.userId === userId
          );
          let nextVotes;

          if (existingVote?.direction === direction) {
            nextVotes = currentVotes.filter((vote) => vote.userId !== userId);
          } else if (existingVote) {
            nextVotes = currentVotes.map((vote) =>
              vote.userId === userId ? { ...vote, direction } : vote
            );
          } else {
            nextVotes = [...currentVotes, { userId, direction }];
          }

          return {
            ...recommendation,
            votes: nextVotes,
            votesUp: nextVotes.filter((vote) => vote.direction === "up").length,
            votesDown: nextVotes.filter((vote) => vote.direction === "down")
              .length,
          };
        }
      );

      await getGroupsCollection().updateOne(
        { _id: group._id },
        { $set: { recommendations: nextRecommendations } }
      );

      const updatedGroup = await getGroupsCollection().findOne({
        _id: group._id,
      });

      res.json({
        group: sanitizeGroup(updatedGroup),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:groupId/recommendations/:recommendationId/comments",
  async (req, res, next) => {
    try {
      const user = requireAuthenticatedUser(req);
      const groupId = req.params.groupId;
      const recommendationId = req.params.recommendationId;
      const userId = String(user._id);
      const text = (req.body.text ?? "").trim();

      if (!text) {
        throw createHttpError("Comment text is required.", 400);
      }

      const group = await findGroup(groupId);
      requireGroup(group);
      const member = requireMember(
        group,
        userId,
        "Only group members can comment."
      );
      const { parsedRecommendationId, recommendation } = findRecommendation(
        group,
        recommendationId
      );

      if (!recommendation) {
        throw createHttpError("Recommendation not found.", 404);
      }

      const nextRecommendations = (group.recommendations ?? []).map(
        (recommendation) => {
          if (!recommendation._id.equals(parsedRecommendationId)) {
            return recommendation;
          }

          return {
            ...recommendation,
            comments: [
              ...(recommendation.comments ?? []),
              {
                _id: new ObjectId(),
                userId,
                displayName: member.displayName,
                username: member.username ?? "",
                text,
                createdAt: new Date(),
              },
            ],
          };
        }
      );

      await getGroupsCollection().updateOne(
        { _id: group._id },
        { $set: { recommendations: nextRecommendations } }
      );

      const updatedGroup = await getGroupsCollection().findOne({
        _id: group._id,
      });

      res.status(201).json({
        group: sanitizeGroup(updatedGroup),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
