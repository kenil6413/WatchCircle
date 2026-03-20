import { useEffect, useState } from "react";
import {
  addRecommendation,
  addRecommendationComment,
  changePassword,
  createGroup,
  createWatchlistItem,
  deleteGroup,
  deleteWatchlistItem,
  getCurrentUser,
  getGroups,
  getWatchlist,
  getWatchlistStats,
  joinGroup,
  leaveGroup,
  loginUser,
  logoutUser,
  removeGroupMember,
  removeRecommendation,
  searchMediaTitles,
  signupUser,
  updateGroup,
  updateWatchlistItem,
  voteRecommendation,
} from "./api/watchcircleApi.js";
import AuthForm from "./components/AuthForm/AuthForm.jsx";
import EditGroupModal from "./components/EditGroupModal/EditGroupModal.jsx";
import GroupDetailPanel from "./components/GroupDetailPanel/GroupDetailPanel.jsx";
import GroupSidebar from "./components/GroupSidebar/GroupSidebar.jsx";
import MembersModal from "./components/MembersModal/MembersModal.jsx";
import NavBar from "./components/NavBar/NavBar.jsx";
import RecommendationModal from "./components/RecommendationModal/RecommendationModal.jsx";
import RecommendationSpotlight from "./components/RecommendationSpotlight/RecommendationSpotlight.jsx";
import WatchlistModal from "./components/WatchlistModal/WatchlistModal.jsx";
import WatchlistPage from "./components/WatchlistPage/WatchlistPage.jsx";
import "./App.css";

const initialLoginForm = {
  email: "",
  password: "",
};

const initialSignupForm = {
  displayName: "",
  email: "",
  password: "",
};

const initialCreateGroupForm = {
  groupName: "",
  description: "",
  groupEmoji: "🎬",
};

const initialJoinGroupForm = {
  joinCode: "",
};

const initialRecommendationForm = {
  title: "",
  category: "Anime",
  platform: "Other",
  rating: "",
  note: "",
  posterUrl: "",
  imdbId: "",
  imdbRating: "",
};

const initialPasswordChangeForm = {
  currentPassword: "",
  newPassword: "",
};

const initialWatchlistForm = {
  title: "",
  category: "Anime",
  platform: "Other",
  status: "Plan to Watch",
  episodeProgress: "",
  rating: "",
  reviewNote: "",
  posterUrl: "",
  imdbId: "",
  imdbRating: "",
};

function getCategoryFromMediaType(type) {
  if (type === "movie") {
    return "Movie";
  }

  if (type === "series") {
    return "TV Show";
  }

  return "Anime";
}

export default function App() {
  const [view, setView] = useState("watchlist");
  const [authMode, setAuthMode] = useState("login");
  const [authUser, setAuthUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [createGroupForm, setCreateGroupForm] = useState(
    initialCreateGroupForm
  );
  const [joinGroupForm, setJoinGroupForm] = useState(initialJoinGroupForm);
  const [recommendationForm, setRecommendationForm] = useState(
    initialRecommendationForm
  );
  const [passwordChangeForm, setPasswordChangeForm] = useState(
    initialPasswordChangeForm
  );
  const [editGroupForm, setEditGroupForm] = useState(initialCreateGroupForm);
  const [groups, setGroups] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistStats, setWatchlistStats] = useState({
    totalTitles: 0,
    watchingCount: 0,
    completedCount: 0,
    averageRating: 0,
    categoryBreakdown: [],
  });
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [dataError, setDataError] = useState("");
  const [groupError, setGroupError] = useState("");
  const [groupSuccess, setGroupSuccess] = useState("");
  const [recommendationError, setRecommendationError] = useState("");
  const [watchlistError, setWatchlistError] = useState("");
  const [mediaResults, setMediaResults] = useState([]);
  const [mediaSearchStatus, setMediaSearchStatus] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");
  const [editGroupError, setEditGroupError] = useState("");
  const [groupSettingsDangerError, setGroupSettingsDangerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] =
    useState(false);
  const [isRecommendationSubmitting, setIsRecommendationSubmitting] =
    useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isEditGroupSubmitting, setIsEditGroupSubmitting] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
  const [isWatchlistSubmitting, setIsWatchlistSubmitting] = useState(false);
  const [watchlistModalMode, setWatchlistModalMode] = useState("create");
  const [watchlistForm, setWatchlistForm] = useState(initialWatchlistForm);
  const [editingWatchlistItemId, setEditingWatchlistItemId] = useState("");
  const [watchlistShareGroupId, setWatchlistShareGroupId] = useState("");
  const [watchlistShareMessage, setWatchlistShareMessage] = useState("");
  const [isWatchlistShareSubmitting, setIsWatchlistShareSubmitting] =
    useState(false);
  const [memberSearchValue, setMemberSearchValue] = useState("");
  const [selectedRecommendationId, setSelectedRecommendationId] = useState("");
  const [recommendationComment, setRecommendationComment] = useState("");
  const [recommendationCommentError, setRecommendationCommentError] =
    useState("");
  const [recommendationWatchlistMessage, setRecommendationWatchlistMessage] =
    useState("");
  const [
    isRecommendationWatchlistSubmitting,
    setIsRecommendationWatchlistSubmitting,
  ] = useState(false);
  const [
    isRecommendationCommentSubmitting,
    setIsRecommendationCommentSubmitting,
  ] = useState(false);
  const [selectedRecommendationCategory, setSelectedRecommendationCategory] =
    useState("All");
  const [isRecommendationEditMode, setIsRecommendationEditMode] =
    useState(false);
  const isMediaSearchOpen = isRecommendationModalOpen || isWatchlistModalOpen;
  const activeMediaTitle = isRecommendationModalOpen
    ? recommendationForm.title
    : watchlistForm.title;
  const activeMediaCategory = isRecommendationModalOpen
    ? recommendationForm.category
    : watchlistForm.category;
  const activeMediaImdbId = isRecommendationModalOpen
    ? recommendationForm.imdbId
    : watchlistForm.imdbId;

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await getCurrentUser();
        setAuthUser(response.user);
      } catch {
        setAuthUser(null);
      } finally {
        setIsAuthReady(true);
      }
    }

    void loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!groupSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setGroupSuccess("");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [groupSuccess]);

  useEffect(() => {
    if (!passwordChangeSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPasswordChangeSuccess("");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [passwordChangeSuccess]);

  useEffect(() => {
    async function loadMediaResults() {
      if (!isMediaSearchOpen) {
        setMediaResults([]);
        setMediaSearchStatus("");
        return;
      }

      if (activeMediaTitle.trim().length < 2) {
        setMediaResults([]);
        setMediaSearchStatus("");
        return;
      }

      if (activeMediaImdbId) {
        setMediaResults([]);
        setMediaSearchStatus("");
        return;
      }

      setMediaSearchStatus("Searching titles...");

      try {
        const results = await searchMediaTitles(
          activeMediaTitle,
          activeMediaCategory
        );
        setMediaResults(results);
        setMediaSearchStatus(results.length === 0 ? "No matches found." : "");
      } catch (error) {
        setMediaResults([]);
        setMediaSearchStatus(error.message);
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadMediaResults();
    }, 280);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeMediaCategory,
    activeMediaImdbId,
    activeMediaTitle,
    isMediaSearchOpen,
  ]);

  useEffect(() => {
    async function loadUserData() {
      if (!authUser?._id) {
        return;
      }

      setIsLoadingData(true);
      setDataError("");

      try {
        const [groupsData, watchlistData, watchlistStatsData] =
          await Promise.all([getGroups(), getWatchlist(), getWatchlistStats()]);

        setGroups(groupsData);
        setWatchlist(watchlistData);
        setWatchlistStats(watchlistStatsData);
      } catch (error) {
        setDataError(error.message);
      } finally {
        setIsLoadingData(false);
      }
    }

    void loadUserData();
  }, [authUser]);

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0]._id);
      return;
    }

    const selectedGroupStillExists = groups.some(
      (group) => group._id === selectedGroupId
    );

    if (!selectedGroupStillExists) {
      setSelectedGroupId(groups[0]?._id ?? "");
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    setSelectedRecommendationCategory("All");
    setIsRecommendationEditMode(false);
    setSelectedRecommendationId("");
  }, [selectedGroupId]);

  useEffect(() => {
    if (!recommendationWatchlistMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setRecommendationWatchlistMessage("");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [recommendationWatchlistMessage]);

  useEffect(() => {
    if (!watchlistShareMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setWatchlistShareMessage("");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [watchlistShareMessage]);

  function replaceGroup(updatedGroup) {
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );
  }

  function removeGroupFromState(groupId) {
    setGroups((currentGroups) =>
      currentGroups.filter((group) => group._id !== groupId)
    );
  }

  function resetMediaSearch() {
    setMediaResults([]);
    setMediaSearchStatus("");
  }

  function closeRecommendationModal() {
    setRecommendationError("");
    resetMediaSearch();
    setRecommendationForm(initialRecommendationForm);
    setIsRecommendationModalOpen(false);
  }

  function closeWatchlistModal() {
    setWatchlistError("");
    setWatchlistShareMessage("");
    resetMediaSearch();
    setWatchlistForm(initialWatchlistForm);
    setEditingWatchlistItemId("");
    setWatchlistShareGroupId("");
    setWatchlistModalMode("create");
    setIsWatchlistModalOpen(false);
  }

  function getDefaultShareGroupId() {
    return selectedGroupId || groups[0]?._id || "";
  }

  function openCreateWatchlistModal() {
    setWatchlistError("");
    setWatchlistShareMessage("");
    resetMediaSearch();
    setWatchlistForm(initialWatchlistForm);
    setWatchlistModalMode("create");
    setEditingWatchlistItemId("");
    setWatchlistShareGroupId(getDefaultShareGroupId());
    setIsWatchlistModalOpen(true);
  }

  function openEditWatchlistModal(item) {
    setWatchlistError("");
    setWatchlistShareMessage("");
    resetMediaSearch();
    setWatchlistForm({
      title: item.title,
      category: item.category,
      platform: item.platform,
      status: item.status,
      episodeProgress: item.episodeProgress ?? "",
      rating: item.rating ? String(item.rating) : "",
      reviewNote: item.reviewNote ?? "",
      posterUrl: item.posterUrl ?? "",
      imdbId: item.imdbId ?? "",
      imdbRating: item.imdbRating ?? "",
    });
    setWatchlistModalMode("edit");
    setEditingWatchlistItemId(item._id);
    setWatchlistShareGroupId(getDefaultShareGroupId());
    setIsWatchlistModalOpen(true);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError("");

    try {
      const response =
        authMode === "signup"
          ? await signupUser(signupForm)
          : await loginUser(loginForm);

      setAuthUser(response.user);
      setLoginForm(initialLoginForm);
      setSignupForm(initialSignupForm);
      setView("watchlist");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAuthInputChange(event) {
    const { name, value } = event.target;

    if (authMode === "signup") {
      setSignupForm((currentForm) => ({ ...currentForm, [name]: value }));
      return;
    }

    setLoginForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleCreateGroupChange(event) {
    const { name, value } = event.target;
    setCreateGroupForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleEditGroupChange(event) {
    const { name, value } = event.target;
    setEditGroupForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleJoinGroupChange(event) {
    setJoinGroupForm({
      joinCode: event.target.value.toUpperCase(),
    });
  }

  function handleRecommendationChange(event) {
    const { name, value } = event.target;
    setRecommendationForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: value };

      if (name === "title") {
        nextForm.posterUrl = "";
        nextForm.imdbId = "";
        nextForm.imdbRating = "";
      }

      return nextForm;
    });
  }

  function handleSelectMedia(result) {
    setRecommendationForm((currentForm) => ({
      ...currentForm,
      title: result.title,
      category: getCategoryFromMediaType(result.type),
      platform: currentForm.platform || "Other",
      posterUrl: result.posterUrl ?? "",
      imdbId: result.imdbId ?? "",
      imdbRating: result.imdbRating ?? "",
      rating:
        result.imdbRating && result.imdbRating !== "N/A"
          ? result.imdbRating
          : currentForm.rating,
    }));
    resetMediaSearch();
  }

  function handleSelectWatchlistMedia(result) {
    setWatchlistForm((currentForm) => ({
      ...currentForm,
      title: result.title,
      category: getCategoryFromMediaType(result.type),
      platform: currentForm.platform || "Other",
      posterUrl: result.posterUrl ?? "",
      imdbId: result.imdbId ?? "",
      imdbRating: result.imdbRating ?? "",
      rating:
        result.imdbRating && result.imdbRating !== "N/A"
          ? result.imdbRating
          : currentForm.rating,
    }));
    resetMediaSearch();
  }

  function handlePasswordChangeInput(event) {
    const { name, value } = event.target;
    setPasswordChangeForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleWatchlistChange(event) {
    const { name, value } = event.target;

    setWatchlistForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: value };

      if (name === "title") {
        nextForm.posterUrl = "";
        nextForm.imdbId = "";
        nextForm.imdbRating = "";
      }

      return nextForm;
    });
  }

  async function logout() {
    try {
      await logoutUser();
    } catch {
      // Clear local app state even if the session is already gone.
    }

    setAuthUser(null);
    setGroups([]);
    setWatchlist([]);
    setSelectedGroupId("");
    setCopiedCode("");
    setAuthError("");
    setDataError("");
    setGroupError("");
    setGroupSuccess("");
    setPasswordChangeError("");
    setPasswordChangeSuccess("");
  }

  async function handleCreateGroupSubmit(event) {
    event.preventDefault();
    setGroupError("");
    setGroupSuccess("");

    try {
      const response = await createGroup({
        groupName: createGroupForm.groupName,
        description: createGroupForm.description,
        groupEmoji: createGroupForm.groupEmoji,
      });

      setGroups((currentGroups) => [response.group, ...currentGroups]);
      setSelectedGroupId(response.group._id);
      setCreateGroupForm(initialCreateGroupForm);
      setIsCreateGroupModalOpen(false);
      setGroupSuccess(
        `Group created. Share code ${response.group.joinCode} to invite others.`
      );
    } catch (error) {
      setGroupError(error.message);
    }
  }

  async function handleJoinGroup(event) {
    event.preventDefault();
    setGroupError("");
    setGroupSuccess("");

    try {
      const response = await joinGroup({
        joinCode: joinGroupForm.joinCode,
      });

      setGroups((currentGroups) => {
        const exists = currentGroups.some(
          (group) => group._id === response.group._id
        );

        if (exists) {
          return currentGroups.map((group) =>
            group._id === response.group._id ? response.group : group
          );
        }

        return [response.group, ...currentGroups];
      });
      setSelectedGroupId(response.group._id);
      setJoinGroupForm(initialJoinGroupForm);
      setGroupSuccess(`Joined ${response.group.groupName} successfully.`);
    } catch (error) {
      setGroupError(error.message);
    }
  }

  async function handleCopyCode(joinCode) {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopiedCode(joinCode);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setGroupError("Could not copy the group code.");
    }
  }

  async function handleRecommendationSubmit(event) {
    event.preventDefault();

    if (!selectedGroup) {
      return;
    }

    setRecommendationError("");
    setIsRecommendationSubmitting(true);

    try {
      const response = await addRecommendation(selectedGroup._id, {
        ...recommendationForm,
        rating: Number(recommendationForm.rating),
      });

      replaceGroup(response.group);
      closeRecommendationModal();
    } catch (error) {
      setRecommendationError(error.message);
    } finally {
      setIsRecommendationSubmitting(false);
    }
  }

  async function handleVoteRecommendation(recommendationId, direction) {
    if (!selectedGroup) {
      return;
    }

    try {
      const response = await voteRecommendation(
        selectedGroup._id,
        recommendationId,
        direction
      );

      replaceGroup(response.group);
    } catch (error) {
      setGroupError(error.message);
    }
  }

  async function handleRecommendationCommentSubmit(event) {
    event.preventDefault();

    if (!selectedGroup || !selectedRecommendation) {
      return;
    }

    setRecommendationCommentError("");
    setIsRecommendationCommentSubmitting(true);

    try {
      const response = await addRecommendationComment(
        selectedGroup._id,
        selectedRecommendation._id,
        recommendationComment
      );

      replaceGroup(response.group);
      setRecommendationComment("");
    } catch (error) {
      setRecommendationCommentError(error.message);
    } finally {
      setIsRecommendationCommentSubmitting(false);
    }
  }

  async function handleAddRecommendationToWatchlist() {
    if (!selectedRecommendation) {
      return;
    }

    setRecommendationWatchlistMessage("");
    setIsRecommendationWatchlistSubmitting(true);

    try {
      await createWatchlistItem({
        title: selectedRecommendation.title,
        category: selectedRecommendation.category || "Anime",
        platform: selectedRecommendation.platform || "Other",
        status: "Plan to Watch",
        episodeProgress: "",
        rating: selectedRecommendation.rating
          ? String(selectedRecommendation.rating)
          : "",
        reviewNote: "",
        posterUrl: selectedRecommendation.posterUrl || "",
        imdbId: selectedRecommendation.imdbId || "",
        imdbRating: selectedRecommendation.imdbRating || "",
      });

      await refreshWatchlist();
      setRecommendationWatchlistMessage("Added to watchlist.");
    } catch (error) {
      setRecommendationWatchlistMessage(error.message);
    } finally {
      setIsRecommendationWatchlistSubmitting(false);
    }
  }

  async function handlePasswordChangeSubmit(event) {
    event.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess("");

    try {
      const response = await changePassword(passwordChangeForm);

      setPasswordChangeForm(initialPasswordChangeForm);
      setPasswordChangeSuccess(response.message);
    } catch (error) {
      setPasswordChangeError(error.message);
    }
  }

  async function refreshWatchlist() {
    if (!authUser?._id) {
      return;
    }

    const [items, stats] = await Promise.all([
      getWatchlist(),
      getWatchlistStats(),
    ]);

    setWatchlist(items);
    setWatchlistStats(stats);
  }

  async function handleWatchlistSubmit(event) {
    event.preventDefault();
    setWatchlistError("");
    setIsWatchlistSubmitting(true);

    try {
      const payload = {
        ...watchlistForm,
        platform: watchlistForm.platform || "Other",
      };

      if (watchlistModalMode === "edit" && editingWatchlistItemId) {
        await updateWatchlistItem(editingWatchlistItemId, payload);
      } else {
        await createWatchlistItem(payload);
      }

      await refreshWatchlist();
      closeWatchlistModal();
    } catch (error) {
      setWatchlistError(error.message);
    } finally {
      setIsWatchlistSubmitting(false);
    }
  }

  async function handleShareWatchlistToGroup() {
    if (!watchlistShareGroupId) {
      setWatchlistShareMessage("Select a group first.");
      return;
    }

    setWatchlistShareMessage("");
    setIsWatchlistShareSubmitting(true);

    try {
      await addRecommendation(watchlistShareGroupId, {
        title: watchlistForm.title,
        category: watchlistForm.category,
        platform: watchlistForm.platform,
        note: watchlistForm.reviewNote || "Shared from watchlist.",
        rating: Number(watchlistForm.rating || watchlistForm.imdbRating || "8"),
        posterUrl: watchlistForm.posterUrl,
        imdbId: watchlistForm.imdbId,
        imdbRating: watchlistForm.imdbRating,
      });

      const updatedGroups = await getGroups();
      setGroups(updatedGroups);
      setWatchlistShareMessage("Shared to group.");
    } catch (error) {
      setWatchlistShareMessage(error.message);
    } finally {
      setIsWatchlistShareSubmitting(false);
    }
  }

  async function handleDeleteWatchlistItem(itemId) {
    try {
      await deleteWatchlistItem(itemId);
      await refreshWatchlist();
    } catch (error) {
      setDataError(error.message);
    }
  }

  async function handleEditGroupSubmit(event) {
    event.preventDefault();

    if (!selectedGroup) {
      return;
    }

    setEditGroupError("");
    setIsEditGroupSubmitting(true);

    try {
      const response = await updateGroup(selectedGroup._id, {
        groupName: editGroupForm.groupName,
        description: editGroupForm.description,
        groupEmoji: editGroupForm.groupEmoji,
      });

      replaceGroup(response.group);
      setIsEditGroupModalOpen(false);
    } catch (error) {
      setEditGroupError(error.message);
    } finally {
      setIsEditGroupSubmitting(false);
    }
  }

  async function handleDeleteGroup() {
    if (!selectedGroup) {
      return;
    }

    setGroupSettingsDangerError("");

    try {
      const response = await deleteGroup(selectedGroup._id);

      removeGroupFromState(response.deletedGroupId);
      setIsEditGroupModalOpen(false);
    } catch (error) {
      setGroupSettingsDangerError(error.message);
    }
  }

  async function handleLeaveGroup() {
    if (!selectedGroup) {
      return;
    }

    setGroupSettingsDangerError("");

    try {
      const response = await leaveGroup(selectedGroup._id);

      if (response.deletedGroupId) {
        removeGroupFromState(response.deletedGroupId);
      } else {
        removeGroupFromState(selectedGroup._id);
      }

      setIsEditGroupModalOpen(false);
    } catch (error) {
      setGroupSettingsDangerError(error.message);
    }
  }

  async function handleRemoveMember(memberUserId) {
    if (!selectedGroup) {
      return;
    }

    try {
      const response = await removeGroupMember(selectedGroup._id, memberUserId);

      replaceGroup(response.group);
    } catch (error) {
      setGroupError(error.message);
    }
  }

  async function handleRemoveRecommendation(recommendationId) {
    if (!selectedGroup) {
      return;
    }

    try {
      const response = await removeRecommendation(
        selectedGroup._id,
        recommendationId
      );

      replaceGroup(response.group);
    } catch (error) {
      setGroupError(error.message);
    }
  }

  const selectedGroup =
    groups.find((group) => group._id === selectedGroupId) ?? null;
  const selectedRecommendation =
    selectedGroup?.recommendations.find(
      (recommendation) => recommendation._id === selectedRecommendationId
    ) ?? null;

  return (
    <main className="app-shell">
      {!isAuthReady ? (
        <section className="auth-shell">
          <section className="auth-marketing">
            <div className="auth-brand">
              <span className="auth-brand__watch">Watch</span>
              <span className="auth-brand__circle">Circle</span>
            </div>
            <p className="hero__copy hero__copy--left">Loading session...</p>
          </section>
        </section>
      ) : !authUser ? (
        <section className="auth-shell">
          <section className="auth-marketing">
            <div className="auth-brand">
              <span className="auth-brand__watch">Watch</span>
              <span className="auth-brand__circle">Circle</span>
            </div>
            <p className="section-kicker">Social watchlist for real people</p>
            <h1>Track it. Rate it. Share it.</h1>
            <p className="hero__copy hero__copy--left">
              Keep your personal watchlist in one place and send the right
              titles to the right group instead of losing them in chats.
            </p>
            <div className="auth-marketing__points">
              <div className="auth-marketing__point">
                <span>Personal watchlist</span>
              </div>
              <div className="auth-marketing__point">
                <span>Social groups</span>
              </div>
              <div className="auth-marketing__point">
                <span>Trusted picks</span>
              </div>
            </div>
          </section>

          <AuthForm
            mode={authMode}
            formData={authMode === "signup" ? signupForm : loginForm}
            errorMessage={authError}
            isSubmitting={isSubmitting}
            onChange={handleAuthInputChange}
            onSubmit={handleAuthSubmit}
            onToggleMode={() =>
              setAuthMode((currentMode) =>
                currentMode === "signup" ? "login" : "signup"
              )
            }
          />
        </section>
      ) : (
        <>
          <NavBar
            activeView={view}
            currentUserName={authUser.displayName}
            currentUserEmail={authUser.email}
            onChangePassword={handlePasswordChangeSubmit}
            onLogout={logout}
            onNavigate={setView}
            onPasswordChangeInput={handlePasswordChangeInput}
            passwordChangeError={passwordChangeError}
            passwordChangeForm={passwordChangeForm}
            passwordChangeSuccess={passwordChangeSuccess}
          />

          {dataError ? (
            <p className="form-error app-error">{dataError}</p>
          ) : null}

          {view === "groups" ? (
            <section className="groups-layout">
              <GroupSidebar
                groups={groups}
                groupError={groupError}
                groupSuccess={groupSuccess}
                joinGroupForm={joinGroupForm}
                onJoinGroup={handleJoinGroup}
                onJoinGroupChange={handleJoinGroupChange}
                onOpenCreateGroup={() => {
                  setGroupError("");
                  setCreateGroupForm(initialCreateGroupForm);
                  setIsCreateGroupModalOpen(true);
                }}
                onSelectGroup={setSelectedGroupId}
                selectedGroupId={selectedGroupId}
              />

              <div className="groups-main">
                {isLoadingData ? (
                  <section className="groups-loading">
                    <div className="groups-loading__inner">
                      <p className="section-kicker">Groups</p>
                      <h1>Loading your groups</h1>
                      <p className="section-copy section-copy--left">
                        Fetching your current groups from the backend.
                      </p>
                    </div>
                  </section>
                ) : (
                  <GroupDetailPanel
                    copied={copiedCode === selectedGroup?.joinCode}
                    currentUserId={authUser._id}
                    activeCategory={selectedRecommendationCategory}
                    group={selectedGroup}
                    isRecommendationEditMode={isRecommendationEditMode}
                    onCopyCode={handleCopyCode}
                    onEditGroup={() => {
                      setIsRecommendationEditMode(
                        (currentValue) => !currentValue
                      );
                    }}
                    onOpenGroupSettings={() => {
                      if (!selectedGroup) {
                        return;
                      }

                      setEditGroupError("");
                      setGroupSettingsDangerError("");
                      setEditGroupForm({
                        groupName: selectedGroup.groupName,
                        description: selectedGroup.description,
                        groupEmoji: selectedGroup.groupEmoji || "🎬",
                      });
                      setIsEditGroupModalOpen(true);
                    }}
                    onOpenAddRecommendation={() => {
                      closeRecommendationModal();
                      setIsRecommendationModalOpen(true);
                    }}
                    onOpenMembers={() => {
                      setMemberSearchValue("");
                      setIsMembersModalOpen(true);
                    }}
                    onOpenRecommendation={(recommendationId) => {
                      setRecommendationComment("");
                      setRecommendationCommentError("");
                      setRecommendationWatchlistMessage("");
                      setSelectedRecommendationId(recommendationId);
                    }}
                    onRemoveRecommendation={handleRemoveRecommendation}
                    onSelectCategory={setSelectedRecommendationCategory}
                    onVoteRecommendation={handleVoteRecommendation}
                  />
                )}
              </div>
            </section>
          ) : null}

          {view === "watchlist" ? (
            <WatchlistPage
              isLoading={isLoadingData}
              items={watchlist}
              onAddItem={openCreateWatchlistModal}
              onDeleteItem={handleDeleteWatchlistItem}
              onEditItem={openEditWatchlistModal}
              stats={watchlistStats}
            />
          ) : null}
        </>
      )}

      <RecommendationModal
        errorMessage={recommendationError}
        formData={recommendationForm}
        isOpen={isRecommendationModalOpen}
        isSubmitting={isRecommendationSubmitting}
        mediaResults={mediaResults}
        mediaSearchStatus={mediaSearchStatus}
        onChange={handleRecommendationChange}
        onClose={closeRecommendationModal}
        onSelectMedia={handleSelectMedia}
        onSubmit={handleRecommendationSubmit}
      />

      <RecommendationSpotlight
        commentError={recommendationCommentError}
        commentValue={recommendationComment}
        currentUserId={authUser?._id ?? ""}
        groupName={selectedGroup?.groupName ?? ""}
        isOpen={Boolean(selectedRecommendation)}
        isSubmittingComment={isRecommendationCommentSubmitting}
        isSubmittingWatchlist={isRecommendationWatchlistSubmitting}
        onAddToWatchlist={handleAddRecommendationToWatchlist}
        onChangeComment={(event) =>
          setRecommendationComment(event.target.value)
        }
        onClose={() => {
          setRecommendationComment("");
          setRecommendationCommentError("");
          setRecommendationWatchlistMessage("");
          setSelectedRecommendationId("");
        }}
        onSubmitComment={handleRecommendationCommentSubmit}
        recommendation={selectedRecommendation}
        watchlistMessage={recommendationWatchlistMessage}
      />

      <EditGroupModal
        eyebrow="Create group"
        errorMessage={groupError}
        formData={createGroupForm}
        isOpen={isCreateGroupModalOpen}
        isSubmitting={false}
        onChange={handleCreateGroupChange}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSubmit={handleCreateGroupSubmit}
        submitLabel="Create group"
        title="Make a new group"
      />

      <EditGroupModal
        canDelete={selectedGroup?.ownerId === authUser?._id}
        canLeave={Boolean(selectedGroup)}
        dangerErrorMessage={groupSettingsDangerError}
        errorMessage={editGroupError}
        formData={editGroupForm}
        isOpen={isEditGroupModalOpen}
        isSubmitting={isEditGroupSubmitting}
        onDelete={handleDeleteGroup}
        onChange={handleEditGroupChange}
        onClose={() => {
          setEditGroupError("");
          setGroupSettingsDangerError("");
          setIsEditGroupModalOpen(false);
          setIsRecommendationEditMode(false);
        }}
        onLeave={handleLeaveGroup}
        onSubmit={handleEditGroupSubmit}
      />

      <MembersModal
        currentUserId={authUser?._id ?? ""}
        group={selectedGroup}
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        onRemoveMember={handleRemoveMember}
        onSearchChange={(event) => setMemberSearchValue(event.target.value)}
        searchValue={memberSearchValue}
      />

      <WatchlistModal
        errorMessage={watchlistError}
        formData={watchlistForm}
        isOpen={isWatchlistModalOpen}
        isSubmitting={isWatchlistSubmitting}
        mediaResults={mediaResults}
        mediaSearchStatus={mediaSearchStatus}
        mode={watchlistModalMode}
        groups={groups}
        onChange={handleWatchlistChange}
        onClose={closeWatchlistModal}
        onSelectMedia={handleSelectWatchlistMedia}
        onShareGroupChange={(event) =>
          setWatchlistShareGroupId(event.target.value)
        }
        onShareToGroup={handleShareWatchlistToGroup}
        onSubmit={handleWatchlistSubmit}
        selectedGroupId={watchlistShareGroupId}
        shareMessage={watchlistShareMessage}
        isShareSubmitting={isWatchlistShareSubmitting}
      />
    </main>
  );
}
