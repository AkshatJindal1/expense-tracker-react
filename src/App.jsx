import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase.js';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

// Component Imports
import { LoginPage } from './pages/LoginPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { AddTransactionPage } from './pages/AddTransactionPage.jsx';
import { SelectionSheet } from './components/SelectionSheet.jsx';
import { AllTransactionsPage } from './pages/AllTransactionsPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { MorePage } from './pages/MorePage.jsx';
import { AdjustmentPage } from './pages/AdjustmentPage.jsx';
import { AccountsPage } from './pages/AccountsPage.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { AddAccountPage } from './pages/AddAccountPage.jsx';
import { AddCategoryPage } from './pages/AddCategoryPage.jsx';
import { ConfirmationModal } from './components/ConfirmationModal.jsx';
import { Spinner } from './components/Spinner.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sheetConfig, setSheetConfig] = useState({ isOpen: false });
  const [confirmationConfig, setConfirmationConfig] = useState({
    isOpen: false,
  });
  const [confirmCallback, setConfirmCallback] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // --- Auth & Data Effects ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      if (!currentUser) {
        navigate('/'); // Redirect to login page if not authenticated
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAccounts([]);
      setCategories([]);
      return;
    }
    const txQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
    const txUnsub = onSnapshot(txQuery, (snapshot) =>
      setTransactions(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
    const accQuery = query(collection(db, 'users', user.uid, 'accounts'));
    const accUnsub = onSnapshot(accQuery, (snapshot) =>
      setAccounts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    const catQuery = query(collection(db, 'users', user.uid, 'categories'));
    const catUnsub = onSnapshot(catQuery, (snapshot) =>
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => {
      txUnsub();
      accUnsub();
      catUnsub();
    };
  }, [user]);

  // --- Custom Back Navigation Logic ---
  const handleBack = () => {
    const bottomNavPaths = ['/transactions', '/analytics', '/more'];
    const currentPath = location.pathname;

    if (bottomNavPaths.includes(currentPath)) {
      navigate('/');
    } else {
      navigate(-1); // Standard browser back behavior
    }
  };

  // --- Data Handling ---

  const openSelectionSheet = (title, items, currentValue, onSelect) => {
    setSheetConfig({ isOpen: true, title, items, currentValue, onSelect });
  };

  const closeSelectionSheet = () => {
    setSheetConfig({ isOpen: false });
  };

  const showConfirmation = ({ title, message, confirmText, onConfirm }) => {
    setConfirmationConfig({ isOpen: true, title, message, confirmText });
    setConfirmCallback(() => onConfirm);
  };

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmationConfig({ isOpen: false });
    setConfirmCallback(null);
  };

  const handleCancelConfirm = () => {
    setConfirmationConfig({ isOpen: false });
    setConfirmCallback(null);
  };

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

  const performDeleteAccounts = async (ids) => {
    const promises = ids.map((id) =>
      deleteDoc(doc(db, 'users', user.uid, 'accounts', id))
    );
    await Promise.all(promises);
  };

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

  const performDeleteCategories = async (ids) => {
    const promises = ids.map((id) =>
      deleteDoc(doc(db, 'users', user.uid, 'categories', id))
    );
    await Promise.all(promises);
  };

  const currentBalances = useMemo(() => {
    if (!accounts || accounts.length === 0) return {};
    const balances = accounts.reduce(
      (acc, account) => ({ ...acc, [account.name]: 0 }),
      {}
    );
    transactions.forEach((tx) => {
      if (tx.type === 'Transfer') {
        if (Object.hasOwn(balances, tx.source))
          balances[tx.source] -= tx.amount;
        if (Object.hasOwn(balances, tx.destination))
          balances[tx.destination] += tx.amount;
      } else if (tx.type === 'Income') {
        if (Object.hasOwn(balances, tx.destination))
          balances[tx.destination] += tx.amount;
      } else if (tx.type === 'Expense') {
        if (Object.hasOwn(balances, tx.source))
          balances[tx.source] -= tx.amount;
      }
      if (tx.splitAmount > 0) {
        const splitwiseAccount = accounts.find((a) => a.type === 'Splitwise');
        if (
          splitwiseAccount &&
          Object.hasOwn(balances, splitwiseAccount.name)
        ) {
          balances[splitwiseAccount.name] += tx.splitAmount;
        }
      }
    });
    return balances;
  }, [transactions, accounts]);

  const handleSignIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch((err) =>
      console.error(err)
    );
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleSaveTransaction = async (transactionData) => {
    const { id, ...data } = transactionData;
    const involved = [];
    if (data.type === 'Expense' && data.source) involved.push(data.source);
    if (data.type === 'Income' && data.destination)
      involved.push(data.destination);
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
      navigate('/transactions');
    }
  };

  const performDeleteTransactions = async (ids) => {
    await Promise.all(
      ids.map((id) => deleteDoc(doc(db, 'users', user.uid, 'transactions', id)))
    );
  };

  const handleSaveAdjustment = async (accountName, difference) => {
    if (!user) return;
    const adjTx = {
      type: difference > 0 ? 'Income' : 'Expense',
      amount: Math.abs(difference),
      category: difference > 0 ? 'Income Adjustment' : 'Expense Adjustment',
      source: difference > 0 ? null : accountName,
      destination: difference > 0 ? accountName : null,
      notes: `Balance adjustment for ${accountName}.`,
      splitAmount: 0,
      date: new Date(),
      involvedAccounts: [accountName],
    };
    try {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), adjTx);
      handleBack();
    } catch (error) {
      console.error('Error saving adjustment:', error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <LoginPage onSignIn={handleSignIn} />;
  }

  const bottomNavPaths = ['/', '/transactions', '/analytics', '/more'];
  const showBottomNav = bottomNavPaths.includes(location.pathname);

  return (
    <div>
      <div className="pb-20">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                user={user}
                transactions={transactions}
                accounts={accounts}
                onNavigate={(path) => navigate(path)}
                onEditTxn={(item) =>
                  navigate('/add-transaction', { state: { initialData: item } })
                }
              />
            }
          />
          <Route
            path="/add-transaction"
            element={
              <AddTransactionPage
                onSave={handleSaveTransaction}
                onBack={handleBack}
                onDelete={(id) =>
                  showConfirmation({
                    title: 'Delete Transaction?',
                    message: 'This cannot be undone.',
                    confirmText: 'Delete',
                    onConfirm: async () => {
                      await performDeleteTransactions([id]);
                      handleBack();
                    },
                  })
                }
                accounts={accounts}
                categories={categories}
                openSelectionSheet={openSelectionSheet}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <AllTransactionsPage
                user={user}
                db={db}
                onEdit={(item) =>
                  navigate('/add-transaction', { state: { initialData: item } })
                }
                onDelete={(ids) =>
                  showConfirmation({
                    title: `Delete ${ids.length} Transaction(s)?`,
                    message: 'This cannot be undone.',
                    confirmText: 'Delete',
                    onConfirm: () => performDeleteTransactions(ids),
                  })
                }
                accounts={accounts}
                openSelectionSheet={openSelectionSheet}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsPage transactions={transactions} onBack={handleBack} />
            }
          />
          <Route
            path="/more"
            element={<MorePage onSignOut={handleSignOut} />}
          />
          <Route
            path="/accounts"
            element={
              <AccountsPage
                accounts={accounts}
                onBack={handleBack}
                onAddNew={() => navigate('/add-account')}
                onEdit={(item) =>
                  navigate('/add-account', { state: { initialData: item } })
                }
                onDelete={(ids) =>
                  showConfirmation({
                    title: `Delete ${ids.length} Account(s)?`,
                    message:
                      'This may affect existing transactions. This action cannot be undone.',
                    confirmText: 'Delete',
                    onConfirm: () => performDeleteAccounts(ids),
                  })
                }
              />
            }
          />
          <Route
            path="/add-account"
            element={
              <AddAccountPage
                onSave={handleSaveAccount}
                onBack={handleBack}
                onDelete={(id) =>
                  showConfirmation({
                    title: 'Delete Account?',
                    message:
                      'Are you sure you want to delete this account? This action cannot be undone.',
                    confirmText: 'Delete',
                    onConfirm: async () => {
                      await performDeleteAccounts([id]);
                      handleBack();
                    },
                  })
                }
                openSelectionSheet={openSelectionSheet}
              />
            }
          />
          <Route
            path="/categories"
            element={
              <CategoriesPage
                categories={categories}
                onBack={handleBack}
                onAddNew={() => navigate('/add-category')}
                onEdit={(item) =>
                  navigate('/add-category', { state: { initialData: item } })
                }
                onDelete={(ids) =>
                  showConfirmation({
                    title: `Delete ${ids.length} Category(s)?`,
                    message:
                      'This will not delete existing transactions with this category. Are you sure?',
                    confirmText: 'Delete',
                    onConfirm: () => performDeleteCategories(ids),
                  })
                }
              />
            }
          />
          <Route
            path="/add-category"
            element={
              <AddCategoryPage
                onSave={handleSaveCategory}
                onBack={handleBack}
                onDelete={(id) =>
                  showConfirmation({
                    title: 'Delete Category?',
                    message: 'Are you sure?',
                    confirmText: 'Delete',
                    onConfirm: async () => {
                      await performDeleteCategories([id]);
                      handleBack();
                    },
                  })
                }
                openSelectionSheet={openSelectionSheet}
              />
            }
          />
          <Route
            path="/adjustment"
            element={
              <AdjustmentPage
                onBack={handleBack}
                onSave={handleSaveAdjustment}
                accounts={accounts}
                currentBalances={currentBalances}
                openSelectionSheet={openSelectionSheet}
              />
            }
          />
        </Routes>
        {showBottomNav && (
          <BottomNav onAddTransaction={() => navigate('/add-transaction')} />
        )}
      </div>
      <SelectionSheet config={sheetConfig} onClose={closeSelectionSheet} />
      <ConfirmationModal
        config={confirmationConfig}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
}

export default App;
