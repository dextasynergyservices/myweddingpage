"use client";

import { useState, useEffect } from "react";
import { Gift, Mail, X, User, Edit, Trash2, ChevronDown, Link, CreditCard } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useCSRFToken } from "@/hooks/useCSRFToken";

type GiftItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  purchasedBy?: string;
  purchased?: boolean;
  message?: string;
  link?: string;
};

type CashGift = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

type ReceivedGift = {
  id: string;
  name: string;
  giftId?: string;
  amount?: number;
  message?: string;
  date: string;
  image?: string;
  approved?: boolean;
  thanked?: boolean;
  contactInfo?: string;
};

type WellWish = {
  id: string;
  name: string;
  message: string;
  date: string;
  image?: string;
  approved?: boolean;
};

interface GiftRegistrationProps {
  initialSubTab?: "registry" | "cash" | "received" | "comments";
}

const GiftRegistration = ({ initialSubTab = "registry" }: GiftRegistrationProps) => {
  const { isDarkMode } = useTheme();
  const { token: csrfToken } = useCSRFToken();
  const [activeTab, setActiveTab] = useState<"registry" | "cash" | "received" | "comments">(
    initialSubTab
  );

  // State for data from database
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [cashGifts, setCashGifts] = useState<CashGift[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<ReceivedGift[]>([]);
  const [comments, setComments] = useState<WellWish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCashEditModalOpen, setIsCashEditModalOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isThankAllOpen, setIsThankAllOpen] = useState(false);
  const [isViewWishOpen, setIsViewWishOpen] = useState(false);
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "gift" | "account";
    id: string;
    name?: string;
  } | null>(null);

  // Form states
  const [editGift, setEditGift] = useState<GiftItem | null>(null);
  const [editAccount, setEditAccount] = useState<CashGift | null>(null);
  const [currentRecipient, setCurrentRecipient] = useState("");
  const [currentWish, setCurrentWish] = useState<WellWish | null>(null);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [thankAllMessage, setThankAllMessage] = useState("");
  const [newGiftLink, setNewGiftLink] = useState("");
  const [newAccount, setNewAccount] = useState<Omit<CashGift, "id">>({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  // New state for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to format numbers with commas
  const formatNumberWithCommas = (num: number): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper function to get gift name by ID from the Gift model
  const getGiftNameById = (giftId: string): string => {
    const gift = gifts.find((g) => g.id === giftId);
    return gift ? gift.name : "Unknown Gift";
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [giftsRes, cashRes, receivedRes, comments] = await Promise.all([
          fetch("/api/gifts"),
          fetch("/api/bank-details"),
          fetch("/api/received-gifts"),
          fetch("/api/comments"),
        ]);

        if (!giftsRes.ok || !cashRes.ok || !receivedRes.ok || !comments.ok) {
          throw new Error("Failed to fetch data");
        }

        const [giftsData, cashData, receivedData, commentsData] = await Promise.all([
          giftsRes.json(),
          cashRes.json(),
          receivedRes.json(),
          comments.json(),
        ]);

        setGifts(giftsData);
        setCashGifts(cashData);
        setReceivedGifts(receivedData);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions with database integration
  const toggleApproval = async (id: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          id,
          approved: !comments.find((w) => w.id === id)?.approved,
        }),
      });

      if (!response.ok) throw new Error("Failed to update approval status");

      const updatedComment = await response.json();
      setComments(comments.map((comment) => (comment.id === id ? updatedComment : comment)));
      toast.success("Comment approval status updated");
    } catch (error) {
      console.error("Failed to toggle approval:", error);
      toast.error("Failed to update approval status");
    }
  };

  const confirmDelete = (type: "gift" | "account", id: string, name?: string) => {
    setItemToDelete({ type, id, name });
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "gift") {
        await deleteGift(itemToDelete.id);
      } else {
        await deleteAccount(itemToDelete.id);
      }
    } finally {
      setIsDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const deleteGift = async (id: string) => {
    try {
      const response = await fetch("/api/gifts", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete gift");

      setGifts(gifts.filter((gift) => gift.id !== id));
      toast.success("Gift deleted successfully");
    } catch (error) {
      console.error("Failed to delete gift:", error);
      toast.error("Failed to delete gift");
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const response = await fetch("/api/bank-details", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete account");

      setCashGifts(cashGifts.filter((account) => account.id !== id));
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    }
  };

  // Updated updateGift function with image upload
  const updateGift = async () => {
    if (!editGift) return;
    try {
      setIsUploading(true);
      let imageUrl = editGift.image || null;

      // Upload new image if selected
      if (imageFile) {
        const toastId = toast.loading("Uploading image...");

        try {
          const formData = new FormData();
          formData.append("file", imageFile);

          const uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            credentials: "include",
            headers: {
              "x-csrf-token": csrfToken || "",
            },
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || "Image upload failed");
          }

          const data = await uploadResponse.json();
          imageUrl = data.url;
          toast.success("Image uploaded successfully", { id: toastId });
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast.error(
            uploadError instanceof Error ? uploadError.message : "Failed to upload image",
            { id: toastId }
          );
          return; // Exit the function if image upload fails
        }
      }

      // Rest of your update logic...
      const payload = {
        ...editGift,
        price: Number(editGift.price),
        image: imageUrl,
      };

      const isUpdate = !!editGift.id && gifts.some((g) => g.id === editGift.id);
      const method = isUpdate ? "PUT" : "POST";
      const endpoint = "/api/gifts";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(
          isUpdate
            ? payload
            : {
                name: payload.name,
                description: payload.description,
                price: payload.price,
                link: payload.link,
                image: payload.image,
              }
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isUpdate ? "update" : "add"} gift`);
      }

      const resultGift = await response.json();

      if (isUpdate) {
        setGifts(gifts.map((gift) => (gift.id === resultGift.id ? resultGift : gift)));
        toast.success("Gift updated successfully");
      } else {
        setGifts([...gifts, resultGift]);
        toast.success("Gift added successfully");
      }

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update gift:", error);
      toast.error(
        `Failed to ${editGift?.id ? "update" : "add"} gift: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsUploading(false);
      setImageFile(null);
    }
  };

  const updateAccount = async () => {
    if (!editAccount) return;
    try {
      const response = await fetch("/api/bank-details", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(editAccount),
      });

      if (!response.ok) throw new Error("Failed to update account");

      const updatedAccount = await response.json();
      setCashGifts(
        cashGifts.map((account) => (account.id === updatedAccount.id ? updatedAccount : account))
      );
      setIsCashEditModalOpen(false);
      toast.success("Account updated successfully");
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account");
    }
  };

  // Updated addGiftFromLink with image upload
  const addGiftFromLink = async () => {
    if (!newGiftLink) return;
    try {
      setIsUploading(true);
      let imageUrl = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET!);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          imageUrl = data.secure_url;
        }
      }

      const newGift: Omit<GiftItem, "id"> = {
        name: "New Gift from Link",
        description: "Description will be fetched from the link",
        price: 0,
        link: newGiftLink,
        image: imageUrl,
      };

      const response = await fetch("/api/gifts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(newGift),
      });

      if (!response.ok) throw new Error("Failed to add gift");

      const createdGift = await response.json();
      setGifts([...gifts, createdGift]);
      setIsAddGiftOpen(false);
      setNewGiftLink("");
      toast.success("Gift added successfully");
    } catch (error) {
      console.error("Failed to add gift:", error);
      toast.error("Failed to add gift");
    } finally {
      setIsUploading(false);
      setImageFile(null);
    }
  };

  const addAccountDetails = async () => {
    try {
      const response = await fetch("/api/bank-details", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(newAccount),
      });

      if (!response.ok) throw new Error("Failed to add account");

      const createdAccount = await response.json();
      setCashGifts([...cashGifts, createdAccount]);
      setIsAddAccountOpen(false);
      setNewAccount({
        bankName: "",
        accountNumber: "",
        accountName: "",
      });
      toast.success("Account added successfully");
    } catch (error) {
      console.error("Failed to add account:", error);
      toast.error("Failed to add account");
    }
  };

  // Thank individual gift giver
  const handleThankYou = (gift: ReceivedGift) => {
    setCurrentRecipient(gift.name);
    setThankYouMessage(
      `Dear ${gift.name},\n\nThank you so much for your generous gift! We truly appreciate your thoughtfulness and support.`
    );
    setIsThankYouOpen(true);
  };

  // Send thank you to individual
  const sendThankYou = async () => {
    try {
      const gift = receivedGifts.find((g) => g.name === currentRecipient);
      if (!gift) return;

      const response = await fetch("/api/received-gifts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: gift.id, message: thankYouMessage }),
      });

      if (!response.ok) throw new Error("Failed to send thank you");

      const updatedGift = await response.json();
      setReceivedGifts(receivedGifts.map((g) => (g.id === updatedGift.id ? updatedGift : g)));
      setIsThankYouOpen(false);
      toast.success("Thank you message sent");
    } catch (error) {
      console.error("Failed to send thank you:", error);
      toast.error("Failed to send thank you");
    }
  };

  // Send thank you to all
  const thankAllGivers = async () => {
    try {
      const response = await fetch("/api/received-gifts/thank-all", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ message: thankAllMessage }),
      });

      if (!response.ok) throw new Error("Failed to thank all givers");

      const updatedGifts = await response.json();
      setReceivedGifts(updatedGifts);
      setIsThankAllOpen(false);
      toast.success("Thank you messages sent to all");
    } catch (error) {
      console.error("Failed to thank all givers:", error);
      toast.error("Failed to thank all givers");
    }
  };

  // View full wish
  const viewFullWish = (wish: WellWish) => {
    setCurrentWish(wish);
    setIsViewWishOpen(true);
  };

  return (
    <div className={`max-w-6xl mx-auto p-4 md:p-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Our Gift Registry</h1>
        <p className="text-center text-sm md:text-base text-muted-foreground">
          Help us start our new life together with these special gifts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto mb-4 md:mb-6 border-b no-scrollbar">
        {(["registry", "cash", "received", "comments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm md:text-base md:px-4 md:py-2 font-medium whitespace-nowrap ${
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            {tab === "registry"
              ? "Gift Registry"
              : tab === "cash"
                ? "Bank Details"
                : tab === "received"
                  ? `Gifts Received (${receivedGifts.length})`
                  : `Well Wishes (${comments.length})`}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mb-4 md:mb-6">
        {activeTab === "registry" && (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditGift({
                  id: "",
                  name: "",
                  description: "",
                  price: 0,
                });
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base"
            >
              <Gift size={16} />
              <span className="hidden sm:inline">Add Custom Gift</span>
              <span className="sm:hidden">Add Custom</span>
            </button>
          </div>
        )}
        {activeTab === "cash" && (
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base"
          >
            <CreditCard size={16} />
            <span>Add Account</span>
          </button>
        )}
        {activeTab === "received" && (
          <button
            onClick={() => {
              setThankAllMessage(
                "Dear Friends and Family,\n\nWe are so grateful for all your generous gifts and support. Thank you for helping us start our new life together!"
              );
              setIsThankAllOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 rounded-lg"
          >
            <Mail size={16} />
            <span>Thank Everyone</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && activeTab === "registry" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gifts.map((gift) => (
            <div key={gift.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{gift.name}</h3>
                {gift.purchased && (
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                    Purchased
                  </span>
                )}
              </div>
              {gift.image && (
                <Image
                  src={gift.image}
                  alt={gift.name}
                  className="w-full h-40 object-cover rounded-md mt-2"
                  width={100}
                  height={100}
                />
              )}
              <p className="text-sm text-muted-foreground mt-1">{gift.description}</p>
              <p className="font-bold mt-2">₦{gift.price.toFixed(2)}</p>
              {gift.link && (
                <a
                  href={gift.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1"
                >
                  <Link size={14} /> View product
                </a>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditGift(gift);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => confirmDelete("gift", gift.id, gift.name)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && activeTab === "cash" && (
        <div className="space-y-4">
          {cashGifts.map((account) => (
            <div
              key={account.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{account.bankName}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditAccount(account);
                      setIsCashEditModalOpen(true);
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete("account", account.id, account.bankName)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm mt-2">{account.accountName}</p>
              <p className="font-mono text-sm mt-1">{account.accountNumber}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && activeTab === "received" && (
        <div className="space-y-4">
          {receivedGifts.map((gift) => (
            <div key={gift.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User size={20} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{gift.name}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          gift.thanked
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {gift.thanked ? "Thanked" : "Not Thanked"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    {gift.giftId ? (
                      <p className="flex items-center gap-1 text-sm">
                        <Gift size={14} /> {getGiftNameById(gift.giftId)}
                      </p>
                    ) : (
                      <p className="flex items-center gap-1 text-sm">
                        <span className="font-medium">
                          ₦{gift.amount ? formatNumberWithCommas(gift.amount) : "0.00"}
                        </span>
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{gift.message}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(gift.date).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleThankYou(gift)}
                      disabled={gift.thanked}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                        gift.thanked
                          ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      }`}
                    >
                      <Mail size={14} />
                      {gift.thanked ? "Thanked" : "Thank"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && activeTab === "comments" && (
        <div className="space-y-4">
          {comments.map((wish) => (
            <div key={wish.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center flex-shrink-0">
                  <User size={20} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{wish.name}</h3>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wish.approved}
                        onChange={() => toggleApproval(wish.id)}
                        className="sr-only peer"
                      />
                      <div
                        className={`relative w-11 h-6 rounded-full peer ${
                          wish.approved
                            ? "bg-green-500 peer-checked:bg-green-600"
                            : ` ${isDarkMode ? "bg-gray-600 " : "bg-gray-600 peer-checked:bg-gray-200"}`
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-[2px] bg-white rounded-full h-5 w-5 transition-all ${
                            wish.approved ? "translate-x-full" : ""
                          }`}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {wish.approved ? "Approved" : "Pending"}
                      </span>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{wish.message}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(wish.date).toLocaleDateString()}
                    </span>
                    {wish.message.length > 100 && (
                      <button
                        onClick={() => viewFullWish(wish)}
                        className="text-sm flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                      >
                        Read more <ChevronDown size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Gift Modal */}
      {isEditModalOpen && editGift && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setImageFile(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">{editGift.id ? "Edit Gift" : "Add New Gift"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gift Name</label>
                <input
                  type="text"
                  value={editGift.name}
                  onChange={(e) => setEditGift({ ...editGift, name: e.target.value })}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editGift.description}
                  onChange={(e) => setEditGift({ ...editGift, description: e.target.value })}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={editGift.price}
                  onChange={(e) =>
                    setEditGift({
                      ...editGift,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link (optional)</label>
                <input
                  type="url"
                  value={editGift.link || ""}
                  onChange={(e) => setEditGift({ ...editGift, link: e.target.value })}
                  className="w-full p-2 rounded border"
                  placeholder="https://example.com/product"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image (optional)</label>
                {editGift.image && (
                  <div className="mb-2">
                    <Image
                      src={editGift.image}
                      alt="Current gift"
                      className="h-20 w-20 object-cover rounded"
                      width={100}
                      height={100}
                    />
                    <button
                      onClick={() => setEditGift({ ...editGift, image: undefined })}
                      className="text-red-500 text-xs mt-1"
                    >
                      Remove image
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
                  className="w-full p-2 rounded border"
                />
                {imageFile && (
                  <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setImageFile(null);
                  }}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={updateGift}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Gift from Link Modal */}
      {isAddGiftOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <button
              onClick={() => {
                setIsAddGiftOpen(false);
                setImageFile(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Gift from Link</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product URL</label>
                <input
                  type="url"
                  value={newGiftLink}
                  onChange={(e) => setNewGiftLink(e.target.value)}
                  className="w-full p-2 rounded border"
                  placeholder="https://example.com/product"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
                  className="w-full p-2 rounded border"
                />
                {imageFile && (
                  <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsAddGiftOpen(false);
                    setImageFile(null);
                  }}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={addGiftFromLink}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-50"
                  disabled={isUploading || !newGiftLink}
                >
                  {isUploading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Edit Modal */}
      {isCashEditModalOpen && editAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <button
              onClick={() => setIsCashEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  value={editAccount.bankName}
                  onChange={(e) => setEditAccount({ ...editAccount, bankName: e.target.value })}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input
                  type="text"
                  value={editAccount.accountName}
                  onChange={(e) =>
                    setEditAccount({
                      ...editAccount,
                      accountName: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  value={editAccount.accountNumber}
                  onChange={(e) =>
                    setEditAccount({
                      ...editAccount,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded border"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsCashEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={updateAccount}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <button
              onClick={() => setIsAddAccountOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Bank Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  value={newAccount.bankName}
                  onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input
                  type="text"
                  value={newAccount.accountName}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      accountName: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  value={newAccount.accountNumber}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded border"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={addAccountDetails}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Modal (Individual) */}
      {isThankYouOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <button
              onClick={() => setIsThankYouOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Thank You Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To: {currentRecipient}</label>
                <textarea
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  className="w-full p-3 rounded-lg border min-h-[200px]"
                  placeholder="Write your thank you message..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsThankYouOpen(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={sendThankYou}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                >
                  Send Thank You
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thank All Modal */}
      {isThankAllOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <button
              onClick={() => setIsThankAllOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Thank Everyone</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">
                  This message will be sent to all gift givers who haven&#39;t been thanked yet.
                </p>
                <textarea
                  value={thankAllMessage}
                  onChange={(e) => setThankAllMessage(e.target.value)}
                  className="w-full p-3 rounded-lg border min-h-[200px]"
                  placeholder="Write your thank you message..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsThankAllOpen(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={thankAllGivers}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                >
                  Send to All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              {itemToDelete.name ? `"${itemToDelete.name}"` : "this item"}? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Wish Modal */}
      {isViewWishOpen && currentWish && (
        <div className="fixed inset-0  z-50 flex items-center justify-center p-4">
          <div
            className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          >
            <button
              onClick={() => setIsViewWishOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-transpare flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-medium">{currentWish.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentWish.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className={`bg-gray rounded-lg p-4 `}>
              <p className="whitespace-pre-line">{currentWish.message}</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentWish.approved}
                  onChange={() => toggleApproval(currentWish.id)}
                  className="sr-only peer"
                />
                <div
                  className={`relative w-11 h-6 rounded-full peer ${
                    currentWish.approved
                      ? "bg-green-500 peer-checked:bg-green-600"
                      : "bg-gray-200 peer-checked:bg-gray-500"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-[2px] bg-white rounded-full h-5 w-5 transition-all ${
                      currentWish.approved ? "translate-x-full" : ""
                    }`}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium">
                  {currentWish.approved ? "Approved" : "Pending"}
                </span>
              </label>
              <button
                onClick={() => setIsViewWishOpen(false)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftRegistration;
