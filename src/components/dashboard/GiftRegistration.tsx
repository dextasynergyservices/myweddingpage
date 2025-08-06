"use client";

import { useState } from "react";
import { Gift, Mail, X, User, Edit, Trash2, Heart, ChevronDown, Link, CreditCard, Banknote } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

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
};

type WellWish = {
  id: string;
  name: string;
  message: string;
  date: string;
  image?: string;
  approved?: boolean;
};

const GiftRegistration = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'registry' | 'cash' | 'received' | 'wellWishes'>('registry');

  // Sample data
  const [gifts, setGifts] = useState<GiftItem[]>([
    {
      id: "1",
      name: "Dinner Set",
      description: "6-piece ceramic dinner set",
      price: 120,
      purchasedBy: "John Doe",
      purchased: true,
      message: "Thank you for your generosity!",
    },
    {
      id: "2",
      name: "Blender",
      description: "High-speed professional blender",
      price: 89.99,
      link: "https://example.com/blender"
    },
  ]);

  const [cashGifts, setCashGifts] = useState<CashGift[]>([
    {
      id: "1",
      bankName: "Chase Bank",
      accountNumber: "1234567890",
      accountName: "John & Jane Doe"
    }
  ]);

  const [receivedGifts, setReceivedGifts] = useState<ReceivedGift[]>([
    {
      id: "1",
      name: "John Doe",
      giftId: "1",
      amount: 120,
      message: "Wishing you a lifetime of happiness! May this gift help you start your new life together.",
      date: "2023-05-15",
      approved: true,
      thanked: true
    },
    {
      id: "2",
      name: "Jane Smith",
      amount: 200,
      message: "For your honeymoon fund! Hope you have an amazing trip.",
      date: "2023-05-18",
      approved: true,
      thanked: false
    },
    {
      id: "3",
      name: "Michael Brown",
      giftId: "2",
      message: "Congratulations on your wedding!",
      date: "2023-05-20",
      approved: false,
      thanked: false
    }
  ]);

  const [wellWishes, setWellWishes] = useState<WellWish[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      message: "Congratulations on your special day! Wishing you both a lifetime of love and happiness together. May your marriage be filled with joy, laughter, and countless beautiful memories.",
      date: "2023-05-12",
      approved: true
    },
    {
      id: "2",
      name: "David Wilson",
      message: "Best wishes for your wedding and your future together! May your love continue to grow stronger with each passing year.",
      date: "2023-05-14",
      approved: false
    }
  ]);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCashEditModalOpen, setIsCashEditModalOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isThankAllOpen, setIsThankAllOpen] = useState(false);
  const [isViewWishOpen, setIsViewWishOpen] = useState(false);
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Form states
  const [editGift, setEditGift] = useState<GiftItem | null>(null);
  const [editAccount, setEditAccount] = useState<CashGift | null>(null);
  const [currentRecipient, setCurrentRecipient] = useState("");
  const [currentWish, setCurrentWish] = useState<WellWish | null>(null);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [thankAllMessage, setThankAllMessage] = useState("");
  const [newGiftLink, setNewGiftLink] = useState("");
  const [newAccount, setNewAccount] = useState<Omit<CashGift, 'id'>>({
    bankName: "",
    accountNumber: "",
    accountName: ""
  });

  // Helper functions
  const toggleApproval = (id: string) => {
    setWellWishes(wellWishes.map(wish =>
      wish.id === id ? { ...wish, approved: !wish.approved } : wish
    ));
  };

  const deleteGift = (id: string) => {
    setGifts(gifts.filter(gift => gift.id !== id));
  };

  const deleteAccount = (id: string) => {
    setCashGifts(cashGifts.filter(account => account.id !== id));
  };

  const updateGift = () => {
    if (!editGift) return;
    setGifts(gifts.map(gift =>
      gift.id === editGift.id ? editGift : gift
    ));
    setIsEditModalOpen(false);
  };

  const updateAccount = () => {
    if (!editAccount) return;
    setCashGifts(cashGifts.map(account =>
      account.id === editAccount.id ? editAccount : account
    ));
    setIsCashEditModalOpen(false);
  };

  const addGiftFromLink = () => {
    if (!newGiftLink) return;
    const newGift: GiftItem = {
      id: Date.now().toString(),
      name: "New Gift from Link",
      description: "Description will be fetched from the link",
      price: 0,
      link: newGiftLink
    };
    setGifts([...gifts, newGift]);
    setIsAddGiftOpen(false);
    setNewGiftLink("");
  };

  const addAccountDetails = () => {
    const newAccountWithId: CashGift = {
      id: Date.now().toString(),
      ...newAccount
    };
    setCashGifts([...cashGifts, newAccountWithId]);
    setIsAddAccountOpen(false);
    setNewAccount({
      bankName: "",
      accountNumber: "",
      accountName: ""
    });
  };

  // Thank individual gift giver
  const handleThankYou = (gift: ReceivedGift) => {
    setCurrentRecipient(gift.name);
    setThankYouMessage(`Dear ${gift.name},\n\nThank you so much for your generous gift! We truly appreciate your thoughtfulness and support.`);
    setIsThankYouOpen(true);
  };

  // Send thank you to individual
  const sendThankYou = () => {
    setReceivedGifts(receivedGifts.map(gift =>
      gift.name === currentRecipient ? { ...gift, thanked: true } : gift
    ));
    setIsThankYouOpen(false);
  };

  // Send thank you to all
  const thankAllGivers = () => {
    setReceivedGifts(receivedGifts.map(gift => ({ ...gift, thanked: true })));
    setIsThankAllOpen(false);
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
        {(['registry', 'cash', 'received', 'wellWishes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm md:text-base md:px-4 md:py-2 font-medium whitespace-nowrap ${
              activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
            }`}
          >
            {tab === 'registry' ? 'Gift Registry' :
             tab === 'cash' ? 'Bank Details' :
             tab === 'received' ? `Gifts Received (${receivedGifts.length})` :
             `Well Wishes (${wellWishes.length})`}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mb-4 md:mb-6">
        {activeTab === 'registry' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsAddGiftOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base"
            >
              <Link size={16} />
              <span className="hidden sm:inline">Add Gift from Link</span>
              <span className="sm:hidden">Add Gift</span>
            </button>
            <button
              onClick={() => {
                setEditGift({
                  id: Date.now().toString(),
                  name: "",
                  description: "",
                  price: 0
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
        {activeTab === 'cash' && (
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base"
          >
            <CreditCard size={16} />
            <span>Add Account</span>
          </button>
        )}
        {activeTab === 'received' && (
          <button
            onClick={() => {
              setThankAllMessage("Dear Friends and Family,\n\nWe are so grateful for all your generous gifts and support. Thank you for helping us start our new life together!");
              setIsThankAllOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 rounded-lg"
          >
            <Mail size={16} />
            <span>Thank Everyone</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      {activeTab === 'registry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gifts.map(gift => (
            <div key={gift.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{gift.name}</h3>
                {gift.purchased && (
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                    Purchased
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{gift.description}</p>
              <p className="font-bold mt-2">${gift.price.toFixed(2)}</p>
              {gift.link && (
                <a href={gift.link} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                  <Link size={14} /> View product
                </a>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => {
                  setEditGift(gift);
                  setIsEditModalOpen(true);
                }}>
                  <Edit size={16} />
                </button>
                <button onClick={() => deleteGift(gift.id)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cash' && (
        <div className="space-y-4">
          {cashGifts.map(account => (
            <div key={account.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <h3 className="font-medium">{account.bankName}</h3>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditAccount(account);
                    setIsCashEditModalOpen(true);
                  }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => deleteAccount(account.id)} className="text-red-500">
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

      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedGifts.map(gift => (
            <div key={gift.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User size={20} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{gift.name}</h3>
                    <div className="flex items-center gap-2">
                      {/* <span className={`text-xs px-2 py-1 rounded-full ${
                        gift.approved
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {gift.approved ? 'Received' : 'Pending'}
                      </span> */}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        gift.thanked
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {gift.thanked ? 'Thanked' : 'Not Thanked'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    {gift.giftId ? (
                      <p className="flex items-center gap-1 text-sm">
                        <Gift size={14} /> Gift
                      </p>
                    ) : (
                      <p className="flex items-center gap-1 text-sm">
                        <span className="font-medium">${gift.amount?.toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {gift.message}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(gift.date).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleThankYou(gift)}
                      disabled={gift.thanked}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                        gift.thanked
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      }`}
                    >
                      <Mail size={14} />
                      {gift.thanked ? 'Thanked' : 'Thank'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'wellWishes' && (
        <div className="space-y-4">
          {wellWishes.map(wish => (
            <div key={wish.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
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
                      <div className={`relative w-11 h-6 rounded-full peer ${
                        wish.approved
                          ? 'bg-green-500 peer-checked:bg-green-600'
                          : 'bg-gray-200 peer-checked:bg-gray-500'
                      }`}>
                        <div className={`absolute top-0.5 left-[2px] bg-white rounded-full h-5 w-5 transition-all ${
                          wish.approved ? 'translate-x-full' : ''
                        }`}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {wish.approved ? 'Approved' : 'Pending'}
                      </span>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {wish.message}
                  </p>
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

      {/* Modals */}
      {isEditModalOpen && editGift && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">{editGift.id ? "Edit Gift" : "Add New Gift"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gift Name</label>
                <input
                  type="text"
                  value={editGift.name}
                  onChange={(e) => setEditGift({...editGift, name: e.target.value})}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editGift.description}
                  onChange={(e) => setEditGift({...editGift, description: e.target.value})}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={editGift.price}
                  onChange={(e) => setEditGift({...editGift, price: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link (optional)</label>
                <input
                  type="url"
                  value={editGift.link || ''}
                  onChange={(e) => setEditGift({...editGift, link: e.target.value})}
                  className="w-full p-2 rounded border"
                  placeholder="https://example.com/product"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={updateGift}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCashEditModalOpen && editAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
            <button onClick={() => setIsCashEditModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  value={editAccount.bankName}
                  onChange={(e) => setEditAccount({...editAccount, bankName: e.target.value})}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input
                  type="text"
                  value={editAccount.accountName}
                  onChange={(e) => setEditAccount({...editAccount, accountName: e.target.value})}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  value={editAccount.accountNumber}
                  onChange={(e) => setEditAccount({...editAccount, accountNumber: e.target.value})}
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

      {isAddGiftOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
            <button onClick={() => setIsAddGiftOpen(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
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
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsAddGiftOpen(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={addGiftFromLink}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddAccountOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
            <button onClick={() => setIsAddAccountOpen(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Bank Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  value={newAccount.bankName}
                  onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input
                  type="text"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                  className="w-full p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
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
          <div className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
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
          <div className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
            <button
              onClick={() => setIsThankAllOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Thank Everyone</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">This message will be sent to all gift givers who haven't been thanked yet.</p>
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

      {/* View Full Wish Modal */}
      {isViewWishOpen && currentWish && (
        <div className="fixed inset-0  z-50 flex items-center justify-center p-4">
          <div className={`relative rounded-xl shadow-lg max-w-md w-full p-6 ${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-black"}`}>
            <button
              onClick={() => setIsViewWishOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-medium">{currentWish.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentWish.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className={`bg-gray rounded-lg p-4 `} >
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
                <div className={`relative w-11 h-6 rounded-full peer ${
                  currentWish.approved
                    ? 'bg-green-500 peer-checked:bg-green-600'
                    : 'bg-gray-200 peer-checked:bg-gray-500'
                }`}>
                  <div className={`absolute top-0.5 left-[2px] bg-white rounded-full h-5 w-5 transition-all ${
                    currentWish.approved ? 'translate-x-full' : ''
                  }`}></div>
                </div>
                <span className="ml-2 text-sm font-medium">
                  {currentWish.approved ? 'Approved' : 'Pending'}
                </span>
              </label>
              <button
                onClick={() => setIsViewWishOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700"
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