import crypto from "node:crypto";

export function sanitizeGroup(group) {
  return {
    _id: String(group._id),
    groupName: group.groupName,
    description: group.description,
    groupEmoji: group.groupEmoji ?? "🎬",
    joinCode: group.joinCode,
    ownerId: group.ownerId,
    ownerName: group.ownerName,
    members: (group.members ?? []).map((member) => ({
      ...member,
      username: member.username ?? "",
    })),
    recommendations: (group.recommendations ?? []).map((recommendation) => ({
      ...recommendation,
      _id: recommendation._id ? String(recommendation._id) : undefined,
      comments: (recommendation.comments ?? []).map((comment) => ({
        ...comment,
        _id: comment._id ? String(comment._id) : undefined,
      })),
    })),
    createdAt: group.createdAt,
  };
}

export function generateJoinCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}
