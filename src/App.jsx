import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './firebase'; // Import from your new file
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, addDoc } from 'firebase/firestore';

// Import your page components
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import BottomNav from './components/BottomNav';
import AddTransactionPage from './pages/AddTransactionPage';
import { SelectionSheet } from './components/SelectionSheet';
import AllTransactionsPage from './pages/AllTransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MorePage from './pages/MorePage';
import AdjustmentPage from './pages/AdjustmentPage';
// ... other pages

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home'); // For navigation

  // Data states
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetConfig, setSheetConfig] = useState({
    title: '',
    items: [],
    currentValue: '',
    onSelect: () => {},
  });

  // --- Authentication Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // --- Firestore Data Fetching Effect ---
  useEffect(() => {
    if (user) {
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
    }
  }, [user]); // This effect re-runs when the user state changes

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
    return <div>Loading...</div>; // Or a proper spinner component
  }

  if (!user) {
    return <LoginPage onSignIn={handleSignIn} />;
  }

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Function to handle saving a new transaction
  const handleSaveTransaction = async (transactionData) => {
    if (!user) return;
    try {
      const txCollection = collection(db, 'users', user.uid, 'transactions');
      await addDoc(txCollection, transactionData);
      navigateTo('home'); // Navigate back home after saving
    } catch (error) {
      console.error("Error saving transaction:", error);
      // You could show an error message to the user here
    }
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
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), adjTx);
      navigateTo('home');
    } catch (error) {
      console.error("Error saving adjustment:", error);
    }
  };

  // Handler function to open the sheet
  // Child components will call this function to trigger the modal.
  const openSelectionSheet = (title, items, currentValue, onSelect) => {
    setSheetConfig({ title, items, currentValue, onSelect });
    setIsSheetOpen(true);
  };

  // Handler to close the sheet
  const closeSelectionSheet = () => {
    setIsSheetOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'add-transaction':
        return (
          <AddTransactionPage
            // Functions (Actions Up)
            onBack={() => navigateTo('home')}
            onSave={handleSaveTransaction}
            openSelectionSheet={openSelectionSheet}

            // Data (Data Down)
            accounts={accounts}
            categories={categories}
          />
        );
      case 'transactions':
        return (
          <AllTransactionsPage
            transactions={transactions}
            accounts={accounts}
            onNavigate={navigateTo}
            openSelectionSheet={openSelectionSheet}
            />
        );
      case 'monthly-summary':
        return (
          <AnalyticsPage
            transactions={transactions}
          />
        );
      case 'more':
        return <MorePage onNavigate={navigateTo} onSignOut={() => handleSignOut} />
      case 'adjustment':
        return (
          <AdjustmentPage 
            onBack={() => navigateTo('more')}
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
      // ... other cases for other pages
    }
  };


  return (
    <div className="pb-20">
      {renderPage()}
      {/* Only show the nav bar on certain pages */}
      {['home', 'transactions', 'monthly-summary', 'more'].includes(currentPage) && (
         <BottomNav 
            currentPage={currentPage} 
            onNavigate={navigateTo}
            onAddTransaction={() => navigateTo('add-transaction')}
         />
      )}
      <SelectionSheet
        isOpen={isSheetOpen}
        title={sheetConfig.title}
        items={sheetConfig.items}
        currentValue={sheetConfig.currentValue}
        onClose={closeSelectionSheet}
        onSelect={sheetConfig.onSelect}
      />
    </div>
  );
}

export default App;