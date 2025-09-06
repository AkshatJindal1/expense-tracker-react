import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { auth, db } from './firebase'; // Import from your new file
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Import your page components
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { BottomNav } from './components/BottomNav';
import { AddTransactionPage } from './pages/AddTransactionPage';
import { SelectionSheet } from './components/SelectionSheet';
import { AllTransactionsPage } from './pages/AllTransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MorePage } from './pages/MorePage';
import { AdjustmentPage } from './pages/AdjustmentPage';
import { AccountsPage } from './pages/AccountsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AddAccountPage } from './pages/AddAccountPage';
import { AddCategoryPage } from './pages/AddCategoryPage';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Spinner } from './components/Spinner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home'); // For navigation
  const [pageHistory, setPageHistory] = useState(['home']); // Navigation history stack.

  // Data states
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [sheetConfig, setSheetConfig] = useState({
    isOpen: false,
    title: '',
    items: [],
    currentValue: '',
    onSelect: () => { },
  });
  const [confirmationConfig, setConfirmationConfig] = useState({ isOpen: false });
  const [confirmCallback, setConfirmCallback] = useState(null);

  // --- Authentication Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setCurrentPage('home');
        setPageHistory(['home']);
        setEditingItem(null);
      }
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // --- Firestore Data Fetching Effect ---
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAccounts([]);
      setCategories([]);
      return;
    }
    // Listeners for transactions.
    const txQuery = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));
    const txUnsub = onSnapshot(txQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    });

    // Listener for Accounts
    const accQuery = query(collection(db, 'users', user.uid, 'accounts'));
    const accUnsub = onSnapshot(accQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(data);
    });

    // Listener for Categories
    const catQuery = query(collection(db, 'users', user.uid, 'categories'));
    const catUnsub = onSnapshot(catQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    });
    // Return a cleanup function to unsubscribe when the user logs out
    return () => {
      txUnsub();
      accUnsub();
      catUnsub();
    };
  }, [user]); // This effect re-runs when the user state changes

  // --- Navigation Logic ---
  const handleBack = useCallback(() => {
    setPageHistory(prev => {
      if (prev.length <= 1) {
        // If on a root page (like 'home'), do nothing. This prevents closing the app.
        return prev;
      }
      const newHistory = prev.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      setCurrentPage(previousPage);
      setEditingItem(null); // Clear editing item on back navigation
      return newHistory;
    });
  }, []);

  const navigateTo = (page, itemToEdit = null) => {
    setEditingItem(itemToEdit);
    setCurrentPage(page);
    setPageHistory(prev => {
      // Avoid pushing duplicates if the user clicks the same navigation item twice
      if (prev[prev.length - 1] === page) return prev;
      return [...prev, page];
    });
  };

  const handleBottomNav = (page) => {
    // Bottom nav navigates to root pages, so we reset the history to that page
    setCurrentPage(page);
    setPageHistory([page]);
    setEditingItem(null);
  };

  // --- Swipe Gesture Handling ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swipeThreshold = 75; // Minimum distance for a swipe to be registered

  const handleTouchStart = (e) => {
    // Don't register swipe if it's on an input, button, or slider
    const target = e.target;
    if (target.closest('input, button, [role="button"]')) {
      touchStartX.current = 0;
      return;
    }
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = 0; // Reset end position
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === 0) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === 0 || touchEndX.current === 0) return;
    const swipedDistance = touchEndX.current - touchStartX.current;

    // Swipe Right (triggers back navigation)
    if (swipedDistance > swipeThreshold) {
      handleBack();
    }

    // Reset values for the next touch
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Handler function to open the sheet
  // Child components will call this function to trigger the modal.
  const openSelectionSheet = (title, items, currentValue, onSelect) => {
    setSheetConfig({ isOpen: true, title, items, currentValue, onSelect });
  };

  // Handler to close the sheet
  const closeSelectionSheet = () => {
    setSheetConfig({ isOpen: false })
  };

  const showConfirmation = ({ title, message, confirmText, onConfirm }) => {
    setConfirmationConfig({ isOpen: true, title, message, confirmText });
    setConfirmCallback(() => onConfirm); // Store the confirm action
  };

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setConfirmationConfig({ isOpen: false });
    setConfirmCallback(null);
  };

  const handleCancelConfirm = () => {
    setConfirmationConfig({ isOpen: false });
    setConfirmCallback(null);
  };

  // Function to handle saving accounts.
  const handleSaveAccount = async (accountData) => {
    const { id, ...data } = accountData;
    const collectionRef = collection(db, 'users', user.uid, 'accounts');
    if (id) {
      await updateDoc(doc(collectionRef, id), data);
    } else {
      await addDoc(collectionRef, data);
    }
    handleBack();
  };

  // Function to handle delete accounts.
  const performDeleteAccounts = async (ids) => {
    const promises = ids.map(id => deleteDoc(doc(db, 'users', user.uid, 'accounts', id)));
    await Promise.all(promises);
  };



  // Function to handle save categories.
  const handleSaveCategory = async (categoryData) => {
    const { id, ...data } = categoryData;
    const collectionRef = collection(db, 'users', user.uid, 'categories');
    if (id) {
      await updateDoc(doc(collectionRef, id), data);
    } else {
      await addDoc(collectionRef, data);
    }
    handleBack();
  };

  // Function to handle delete categories.
  const performDeleteCategories = async (ids) => {
    const promises = ids.map(id => deleteDoc(doc(db, 'users', user.uid, 'categories', id)));
    await Promise.all(promises);
  };

  const currentBalances = useMemo(() => {
    if (!accounts || accounts.length === 0) return {};

    const balances = accounts.reduce((acc, account) => ({ ...acc, [account.name]: 0 }), {});

    transactions.forEach((tx) => {
      if (tx.type === "Transfer") {
        if (balances.hasOwnProperty(tx.source)) balances[tx.source] -= tx.amount;
        if (balances.hasOwnProperty(tx.destination)) balances[tx.destination] += tx.amount;
      }
      if (tx.type === "Income") {
        if (balances.hasOwnProperty(tx.destination)) balances[tx.destination] += tx.amount;
      }
      if (tx.type === "Expense") {
        if (balances.hasOwnProperty(tx.source)) balances[tx.source] -= tx.amount;
      }
      if (tx.splitAmount > 0) {
        const splitwiseAccount = accounts.find(
          (a) => a.type === "Splitwise"
        );
        if (splitwiseAccount && balances.hasOwnProperty(splitwiseAccount.name)) {
          balances[splitwiseAccount.name] += tx.splitAmount;
        }
      }
    });
    return balances;
  }, [transactions, accounts]);

  const handleSignIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(err => console.error(err));
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return <Spinner />;
  }

  // Function to handle saving a new transaction
  const handleSaveTransaction = async (transactionData) => {
    const { id, ...data } = transactionData;
    const involved = [];
    if (data.type === 'Expense' && data.source) involved.push(data.source);
    if (data.type === 'Income' && data.destination) involved.push(data.destination);
    if (data.type === 'Transfer') {
      if (data.source) involved.push(data.source);
      if (data.destination) involved.push(data.destination);
    }
    const finalData = { ...data, involvedAccounts: involved };
    const ref = collection(db, 'users', user.uid, 'transactions');
    if (id) {
      await updateDoc(doc(ref, id), finalData);
      handleBack();
    } else {
      await addDoc(ref, finalData);
      // Reset history to the transactions list for a clean navigation stack
      setCurrentPage('transactions');
      setPageHistory(['transactions']);
    }
  };

  const performDeleteTransactions = async (ids) => {
    await Promise.all(ids.map(id => deleteDoc(doc(db, 'users', user.uid, 'transactions', id))));
  };

  // Handler function to save the adjustment transaction
  const handleSaveAdjustment = async (accountName, difference) => {
    if (!user) return;

    const adjTx = {
      type: difference > 0 ? "Income" : "Expense",
      amount: Math.abs(difference),
      category: difference > 0 ? "Income Adjustment" : "Expense Adjustment",
      source: difference > 0 ? null : accountName,
      destination: difference > 0 ? accountName : null,
      notes: `Balance adjustment for ${accountName}.`,
      splitAmount: 0,
      date: new Date(), // Use serverTimestamp() in production
      involvedAccounts: [accountName],
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), adjTx);
      handleBack();
    } catch (error) {
      console.error("Error saving adjustment:", error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'add-transaction':
        return (
          <AddTransactionPage
            onSave={handleSaveTransaction}
            onBack={handleBack}
            onDelete={(id) => showConfirmation({
              title: 'Delete Transaction?', message: 'This cannot be undone.', confirmText: 'Delete',
              onConfirm: async () => {
                await performDeleteTransactions([id]);
                handleBack();
              }
            })}
            initialData={editingItem}
            accounts={accounts}
            categories={categories}
            openSelectionSheet={openSelectionSheet}
          />
        );
      case 'transactions':
        return (
          <AllTransactionsPage
            user={user}
            db={db}
            onEdit={(item) => navigateTo('add-transaction', item)}
            onDelete={(ids) => showConfirmation({
              title: `Delete ${ids.length} Transaction(s)?`, message: 'This cannot be undone.', confirmText: 'Delete',
              onConfirm: () => performDeleteTransactions(ids)
            })}
            accounts={accounts}
            onNavigate={navigateTo}
            openSelectionSheet={openSelectionSheet}
          />
        );
      case 'monthly-summary':
        return (
          <AnalyticsPage
            transactions={transactions}
            onBack={handleBack}
          />
        );
      case 'more':
        return (
          <MorePage
            onNavigate={navigateTo}
            onSignOut={handleSignOut}
          />
        )
      case 'accounts':
        return (
          <AccountsPage
            accounts={accounts}
            onBack={handleBack}
            onAddNew={() => navigateTo('add-account')}
            onEdit={(item) => navigateTo('add-account', item)}
            onDelete={(ids) => showConfirmation({
              title: `Delete ${ids.length} Account(s)?`,
              message: 'This may affect existing transactions. This action cannot be undone.',
              confirmText: 'Delete',
              onConfirm: () => performDeleteAccounts(ids)
            })}
          />
        )
      case 'categories':
        return (
          <CategoriesPage
            categories={categories}
            onBack={handleBack}
            onAddNew={() => navigateTo('add-category')}
            onEdit={(item) => navigateTo('add-category', item)}
            onDelete={(ids) => showConfirmation({
              title: `Delete ${ids.length} Category(s)?`,
              message: 'This will not delete existing transactions with this category. Are you sure?',
              confirmText: 'Delete',
              onConfirm: () => performDeleteCategories(ids)
            })}
          />
        )
      case 'add-account':
        return (
          <AddAccountPage
            onSave={handleSaveAccount}
            onBack={handleBack}
            onDelete={(id) => showConfirmation({
              title: 'Delete Account?',
              message: 'Are you sure you want to delete this account? This action cannot be undone.',
              confirmText: 'Delete',
              onConfirm: async () => {
                await performDeleteAccounts([id]);
                handleBack();
              }
            })}
            initialData={editingItem}
            openSelectionSheet={openSelectionSheet}
          />
        )
      case 'add-category':
        return (
          <AddCategoryPage
            onSave={handleSaveCategory}
            onBack={handleBack}
            onDelete={(id) => showConfirmation({
              title: 'Delete Category?',
              message: 'Are you sure?',
              confirmText: 'Delete',
              onConfirm: async () => {
                await performDeleteCategories([id]);
                handleBack();
              }
            })}
            initialData={editingItem}
            openSelectionSheet={openSelectionSheet}
          />
        )
      case 'adjustment':
        return (
          <AdjustmentPage
            onBack={handleBack}
            onSave={handleSaveAdjustment}
            accounts={accounts}
            currentBalances={currentBalances}
            openSelectionSheet={openSelectionSheet}
          />
        )
      case 'home':
      default:
        return (
          <HomePage
            user={user}
            transactions={transactions}
            accounts={accounts}
            onNavigate={navigateTo}
          />
        );
    }
  };

  if (!user) {
    return <LoginPage onSignIn={handleSignIn} />;
  }

  return (
    <>
      <div className="pb-20">
        {renderPage()}
        {/* Only show the nav bar on certain pages */}
        {['home', 'transactions', 'monthly-summary', 'more'].includes(currentPage) && (
          <BottomNav
            currentPage={currentPage}
            onNavigate={handleBottomNav}
            onAddTransaction={() => navigateTo('add-transaction')}
          />
        )}
      </div>
      <SelectionSheet
        config={sheetConfig}
        onClose={closeSelectionSheet}
      />
      <ConfirmationModal
        config={confirmationConfig}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
    </>
  );
}

export default App;